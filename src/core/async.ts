enum TaskStatus {
  PENDING = 0,
  RUNNING = 1,
  COMPLETED = 2,
  FAILED = 3,
  CANCELLED = 4,
  TIMEOUT = 5
}

class AsyncTaskAlreadyRunning extends Error {
  constructor(message: string) {
    super(message);
    this.name = "async_task_already_running";
  }
}

class AsyncTaskRunningFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "async_task_running_failed";
  }
}

class AsyncTask<T> {
  private task: Promise<T>;
  private runnable: (t: T) => void;
  private startTime: number;
  private endTime: number;
  private timeout: number;
  private duration: number;
  private result: any;
  private error: any;
  private status: TaskStatus = TaskStatus.PENDING;
  constructor(
    task: Promise<T>, runnable: (t: T) => void, timeout?: number) {
    this.task = task;
    this.runnable = runnable;
    this.startTime = Date.now();
    this.endTime = 0;
    this.duration = 0;
    this.timeout = timeout || -1;
    this.result = null;
    this.error = null;
  }
  run(taskManager: AsyncTaskManager<T>): void {
    this.status = TaskStatus.RUNNING;
    this.task.then((result: any) => {
      this.result = result;
      this.status = TaskStatus.COMPLETED;
      this.endTime = Date.now();
      this.duration = this.endTime - this.startTime;
      this.runnable(result);
      taskManager.checkTaskStatus(this);
    }).catch((error: any) => {
      this.error = error;
      this.status = TaskStatus.FAILED;
      this.endTime = Date.now();
      this.duration = this.endTime - this.startTime;
      this.runnable(error);
      taskManager.checkTaskStatus(this);
    });
  }
  getStatus(): TaskStatus {
    return this.status;
  }
  getResult(): any {
    return this.result;
  }
}

class AsyncTaskManager<T> {
  private tasks: AsyncTask<T>[] = [];
  private counter: number = 0;
  private running: boolean = false;
  private allTasksCompleted: boolean = false;
  private onAllTasksCompleted: () => void = () => {};
  private onTaskFailed: () => void = () => {};
  constructor() {
  }
  getTasks(): AsyncTask<T>[] {
    return this.tasks;
  }
  addTask(task: AsyncTask<T>): void {
    if(this.running) {
      throw new AsyncTaskAlreadyRunning("AsyncTaskManager is already running");
    }
    this.tasks.push(task);
  }
  isRunning(): boolean {
    return this.running;
  }
  start(onCompleted?: () => void, onError?: () => void): void {
    if(this.running) {
      throw new AsyncTaskAlreadyRunning("AsyncTaskManager is already running");
    }
    this.running = true;
    if(onCompleted) {
      this.onAllTasksCompleted = onCompleted;
    }
    if(onError) {
      this.onTaskFailed = onError;
    }
    for(let i = 0; i < this.tasks.length; i++) {
      let task = this.tasks[i];
      task.run(this);
    }
    // this.runNextTask();
  }
  updateTaskStatus(task: AsyncTask<T>) {
    if(task.getStatus() === TaskStatus.COMPLETED) {
      this.counter++;
      if(this.counter === this.tasks.length) {
        this.allTasksCompleted = true;
      }
    }else if(task.getStatus() === TaskStatus.FAILED || task.getStatus() === TaskStatus.TIMEOUT) {
      this.onTaskFailed();
      throw new AsyncTaskRunningFailed("AsyncTaskManager failed to run task");
    }
  }
  checkTaskStatus(task: AsyncTask<T>): void {
    this.updateTaskStatus(task);
    if(this.allTasksCompleted) {
      this.onAllTasksCompleted();
    }
  }
}

export {
  TaskStatus,
  AsyncTask,
  AsyncTaskManager
}