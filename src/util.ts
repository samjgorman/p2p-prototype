
//Simple, flexible class for a timer to determine whether a timeout has occured.
export class Timer{
    _timeout: number;
    _stopped: boolean;
    _expired: boolean;

    constructor(timeout = 10 ) {
        this._timeout = timeout;
        this._stopped = true;
        this._expired = false;
      }

    async start(){
        this._stopped = false;

        var counter = this._timeout;
        const interval = setInterval(() => {
            console.log(counter);
            counter--;
              
            if (counter < 0 ) {
              clearInterval(interval);
              if(this._stopped == false){ this._expired = true;}
            }
          }, 1000);
    }

     async stop(){
        this._stopped = true;

    }

    async topped(){
        return this._stopped;

    }

    // countdown(){
    //     var counter = this._timeout;
    //     const interval = setInterval(() => {
    //         console.log(counter);
    //         counter--;
              
    //         if (counter < 0 ) {
    //           clearInterval(interval);
    //           if(this._stopped == false) this._expired = true;
    //         }
    //       }, 1000);

    // }

     async expired(){
        return this._expired ;
    }

 
}