interface IQueueEntry {
    job : Function;
    resolve : Function;
}

export class RequestQueue {

    constructor() {
        this.queue = [];
        this.isRunning = false;
    }

    private queue : IQueueEntry[];
    private isRunning : boolean;
    private resolveEmptyPromise: null | Function = null;


    private awaitEmpty = () => {
        if (this.resolveEmptyPromise) {
            this.resolveEmptyPromise();
            this.resolveEmptyPromise = null;
        }
    }

    public onEmpty(): Promise<void> {
        return new Promise(resolve => {
            this.resolveEmptyPromise = resolve;
        });
    }
  
    addJob(jobFnc:Function, resolveFnc:Function) {
        this.queue.push({
            job:    jobFnc,
            resolve: async (result:any) => {
                await resolveFnc(result);
                this.runNextJob();
            }
        } as IQueueEntry);

        if(!this.isRunning){
            this.runNextJob();
        }
    }

    async runNextJob() {
        if (this.queue.length === 0) {
            this.isRunning = false;
            this.awaitEmpty();
            return;
        }

        this.isRunning = true;
        const currQueue = this.queue.shift() as IQueueEntry;

        try {
            const jobData = await currQueue.job();
            currQueue.resolve(jobData);
        } catch (error) {
            console.error("Job in request queue failed with error: ", error);
            this.runNextJob();
        }
    }

    public clearQueue() {
        this.queue = [] as IQueueEntry[];
    }
    
  }