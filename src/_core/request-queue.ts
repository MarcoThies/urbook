
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
        // only for testing: if (this.queue.length == 1) { await new Promise(f => setTimeout(f, 25000)); }
        await this.runNextJob();
    }

    public getCurrentQueueLength() : number {
        return this.queue.length;
    }

    clearQueue() {
        this.queue = [] as Function[];
    }
    
  }