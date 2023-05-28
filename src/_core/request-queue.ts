
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
        if (this.queue.length == 3) { await new Promise(f => setTimeout(f, 15000)); }
        await this.runNextJob();
    }

    clearQueue() {
        this.queue = [] as Function[];
    }
  }