import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, offers } from "@/db/schema";
import { eq } from "drizzle-orm";
const YA_KEY = process.env.YANDEX_GPT_API_KEY;
const YA_FOLDER = process.env.YANDEX_FOLDER_ID;
const SECRET = process.env.CRON_SECRET || "kosmozaim-cron-2024";
const NAMES=["Александр","Дмитрий","Максим","Иван","Артём","Андрей","Михаил","Сергей","Николай","Евгений","Алексей","Владимир","Анна","Мария","Елена","Ольга","Наталья","Татьяна","Ирина","Светлана","Екатерина","Юлия","Дарья","Алина"];
const FB=["Оформил заявку, деньги пришли быстро.","Всё хорошо, одобрили сразу.","Пользуюсь не первый раз.","Быстрое оформление.","Удобный сервис.","Нормально, без комиссий."];
function rn(){return NAMES[Math.floor(Math.random()*NAMES.length)];}
function rr(){const w=[1,2,5,25,67],t=100;let r=Math.random()*t;for(let i=0;i<w.length;i++){r-=w[i];if(r<=0)return i+1;}return 5;}
async function gen(title:string,rating:number):Promise<string|null>{
if(!YA_KEY||!YA_FOLDER)return null;
try{const mood=rating>=4?"положительный":rating===3?"нейтральный":"негативный";
const r=await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Api-Key "+YA_KEY,"x-folder-id":YA_FOLDER},body:JSON.stringify({modelUri:"gpt://"+YA_FOLDER+"/yandexgpt-lite/latest",completionOptions:{stream:false,temperature:0.8,maxTokens:200},messages:[{role:"system",text:"Ты обычный человек из России. Короткий отзыв 2-4 предложения. Без markdown."},{role:"user",text:"Напиши "+mood+" отзыв на "+title+". Оценка "+rating+" из 5."}]})});
if(!r.ok)return null;const d=await r.json();return d.result?.alternatives?.[0]?.message?.text?.replace(/\\*/g,"").trim()||null;}catch{return null;}}
export async function GET(req:NextRequest){
const s=req.nextUrl.searchParams.get("secret");
if(s!==SECRET)return NextResponse.json({error:"Forbidden"},{status:403});
const count=parseInt(req.nextUrl.searchParams.get("count")||"1");
const active=await db.select().from(offers).where(eq(offers.isActive,true));
if(active.length===0)return NextResponse.json({error:"Нет офферов"},{status:400});
const results=[];
for(let i=0;i<count;i++){const offer=active[Math.floor(Math.random()*active.length)];const name=rn(),rating=rr();
let comment=await gen(offer.title,rating);if(!comment)comment=FB[Math.floor(Math.random()*FB.length)];
await db.insert(reviews).values({offerId:offer.id,authorName:name,rating,comment,isApproved:true});
results.push({offer:offer.title,name,rating,comment});}
