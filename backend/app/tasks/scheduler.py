from apscheduler.schedulers.background import BackgroundScheduler
from app.ml.train import retrain_model

scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.add_job(
        retrain_model,
        trigger="cron",
        day_of_week="sat",
        hour=12,
        minute=0,
        id="weekly_retrain",
        replace_existing=True,
    )
    scheduler.start()