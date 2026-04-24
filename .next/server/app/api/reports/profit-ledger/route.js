"use strict";(()=>{var e={};e.id=5817,e.ids=[5817],e.modules={38013:e=>{e.exports=require("mongodb")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},33144:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>E,patchFetch:()=>f,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>g,staticGenerationAsyncStorage:()=>m});var r={};a.r(r),a.d(r,{GET:()=>c,POST:()=>d});var n=a(49303),o=a(88716),i=a(60670),s=a(87070),l=a(24544);async function c(){try{let e=await l.Z.getConnection(),[t]=await e.execute("SELECT * FROM profit_ledger ORDER BY id DESC"),a=`
      SELECT 
        id,
        bill_date,
        customer_name,
        SUM(total) AS total_amount,
        payment_mode,
        status
      FROM billing
      GROUP BY id, bill_date, customer_name, payment_mode, status
      ORDER BY bill_date DESC
    `,[r]=await e.execute(a),[n]=await e.execute("SELECT * FROM expenses ORDER BY created_at DESC");e.release();let o={profitLedger:t,billingData:r,expensesData:n,summary:{totalIncome:r.reduce((e,t)=>e+parseFloat(t.total_amount||0),0),totalExpenses:n.reduce((e,t)=>e+parseFloat(t.amount||0),0),netProfit:0}};return o.summary.netProfit=o.summary.totalIncome-o.summary.totalExpenses,s.NextResponse.json(o)}catch(e){return console.error("Fetch profit ledger error:",e),s.NextResponse.json([])}}async function d(e){try{let{entries:t,autoGenerate:a}=await e.json(),r=await l.Z.getConnection();try{await r.beginTransaction(),await r.execute("DELETE FROM profit_ledger");let e=[];if(a){let t=`
          SELECT 
            bill_date as date,
            CONCAT('Bill #', id, ' - ', customer_name) as description,
            'Sales' as category,
            SUM(total) as income,
            0 as expense
          FROM billing
          GROUP BY id, bill_date, customer_name
          ORDER BY bill_date DESC
        `,[a]=await r.execute(t),n=`
          SELECT 
            created_at as date,
            item as description,
            'Expenses' as category,
            0 as income,
            amount as expense
          FROM expenses
          ORDER BY created_at DESC
        `,[o]=await r.execute(n);e=[...a,...o];let i=0;e=e.map(e=>(i+=parseFloat(e.income||0)-parseFloat(e.expense||0),{...e,balance:i}))}else e=t;for(let t of e)await r.execute(`INSERT INTO profit_ledger 
            (date, description, category, income, expense, balance) 
          VALUES (?, ?, ?, ?, ?, ?)`,[t.date,t.description,t.category,t.income,t.expense,t.balance]);return await r.commit(),r.release(),s.NextResponse.json({success:!0,message:"Profit ledger updated successfully",entriesGenerated:e.length})}catch(e){throw await r.rollback(),r.release(),e}}catch(e){return console.error("Bulk insert profit ledger error:",e),s.NextResponse.json({error:"Failed to update profit ledger"},{status:500})}}let u=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/reports/profit-ledger/route",pathname:"/api/reports/profit-ledger",filename:"route",bundlePath:"app/api/reports/profit-ledger/route"},resolvedPagePath:"D:\\Fsenterprise - Main - Nextjs\\app\\api\\reports\\profit-ledger\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:g}=u,E="/api/reports/profit-ledger/route";function f(){return(0,i.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:m})}},24544:(e,t,a)=>{a.d(t,{Z:()=>o});var r=a(2021);async function n(){return(await r.Z).db()}let o={getConnection:async()=>{let e=await n();return{execute:async(t,a=[])=>{let r=e.collection("billing");if(t.includes("SELECT")&&t.includes("WHERE id = ?")){let e=await r.findOne({id:Number(a[0])});return[e?[e]:[]]}return t.includes("SELECT")&&t.includes("ORDER BY")?[await r.find({}).sort({bill_date:-1}).toArray()]:t.includes("INSERT INTO billing")?[{insertId:(await r.insertOne({id:a[0],customer_name:a[1],phone_number:a[2],payment_mode:a[3],status:a[4],bill_date:a[5],gsm_number:a[6],description:a[7],quantity:a[8],price:a[9],total:a[10],subtotal:a[11]})).insertedId}]:t.includes("DELETE FROM billing")?(await r.deleteOne({id:Number(a[0])}),[{affectedRows:1}]):[]},beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}}},getCollection:async function(e){return(await n()).collection(e)}}},2021:(e,t,a)=>{let r;a.d(t,{Z:()=>i});var n=a(38013);if(!process.env.MONGO_URL)throw Error("Please add your Mongo URI to .env.local");let o=process.env.MONGO_URL;r=new n.MongoClient(o,{}).connect(),async function(){try{let e=await r;await e.db().command({ping:1}),console.log("✅ MongoDB Connected Successfully")}catch(e){throw console.error("❌ MongoDB Connection Failed:",e),e}}();let i=r}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[8948,5972],()=>a(33144));module.exports=r})();