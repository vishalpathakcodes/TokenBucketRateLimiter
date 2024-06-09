const {CronJob}=require('cron')
const express=require('express');
const app = express();
const PORT=process.env.PORT||3000;
app.use(express.json())
const LIMIT_SIZE=10;

const TOKENS=[];

const refillBucket=()=>{
    if(TOKENS.length<LIMIT_SIZE){
        TOKENS.push(Date.now());
    }
};
app.get('/bucket',(req,res)=>{
    res.json({
        bucketLimit:LIMIT_SIZE,
        currentBucketSize:TOKENS.length,
        bucket:TOKENS
    });
});

const limitingMiddleware =(req, res, next) =>{
    if(TOKENS.length>0){
       const token= TOKENS.shift();
       console.log(`Token ${token} is used`);

       res.set('X-Ratelimit-Remaining',TOKENS.length);
       next();
    }else{
        res.status(429).set('X-RateLimit-Remaining', 0).set('Retry-After', 2).json({
            success: false,
            message: 'Too many requests'
        });
    }
}

app.use(limitingMiddleware);
app.get('/test',(req, res) => {
    const ROCK_PAPER_SCISSORS = ['rock 🪨', 'paper 📃', 'scissors ✂️'];

    const randomIndex = Math.floor(Math.random() * 3);
    const randomChoice = ROCK_PAPER_SCISSORS[randomIndex];
  
    res.json({
      success: true,
      message: `You got ${randomChoice}`
    });
})
const job = new CronJob('*/2 * * * * *', () => {
    refillBucket();
});
app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
    job.start();
})