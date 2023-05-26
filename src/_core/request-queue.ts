
export class RequestQueue {

    constructor() {
        this.queue = [];
        this.isRunning = false;
    }
  
    private queue : Function[];
    private isRunning : boolean;
  
    addJob(job : Function) {
        this.queue.push(job as Function);
    }
  
    async runNextJob() {
        console.log(this.queue.length);
        if (this.queue.length === 0) {
            this.isRunning = false;
            return;
        }
  
        this.isRunning = true;
        const job = this.queue.shift() as Function;
        try {
            await job();
        } catch (error) {
            console.error("Job in request queue failed with error: ", error);
        }
        await this.runNextJob();
    }

    clearQueue() {
        this.queue = [] as Function[];
    }
  
    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
  }