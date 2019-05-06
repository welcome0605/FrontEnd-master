 declare var zEmbed: {

        ( callback: () => void ) : void;

        activate?( options: any ): void;
        hide?(): void;
        identify?( user: any ): void;
        setHelpCenterSuggestions?( options: any ): void;
        setLocale?( locale: string ) : void;
        show?(): void;
    }

    interface VisibilityQueueItem {
      resolve: any;
      reject: any;
      methodName: string;
    }

    export class ZendeskService {
        private isLoaded: boolean;
        private visibilityDelay: number;
        private visibilityQueue: VisibilityQueueItem[];
        private visibilityTimer: number;


        constructor() {

            this.isLoaded = false;
            this.visibilityDelay = 500; // Milliseconds.
            this.visibilityQueue = [];
            this.visibilityTimer = null;
            zEmbed(
                () : void => {

                    this.isLoaded = true;
                    this.flushVisibilityQueue();

                }
            )

        }

        public hide() : Promise<void> {

            return( this.promisifyVisibility( "hide" ) );

        }

        public show() : Promise<void> {

            return( this.promisifyVisibility( "show" ) );

        }

        public activate(): Promise<void> {
            return( this.promisifyVisibility("activate"));
        }

        public identify( user: any ) : Promise<void> {

            return( this.promisify( "identify", [ user ] ) );

        }

        private flushVisibilityQueue() : void {
            while ( this.visibilityQueue.length ) {
                var item = this.visibilityQueue.shift();
                if ( this.visibilityQueue.length ) {

                    console.warn( "Skipping queued method:", item.methodName );
                    item.resolve();
                } else {

                    console.log( "Invoking last method:", item.methodName );
                    this.tryToApply( item.methodName, [], item.resolve, item.reject );

                }

            }

        }

        private promisify( methodName: string, methodArgs: any[] ) : Promise<void> {

            var promise = new Promise<void>(
                ( resolve: Function, reject: Function ) : void => {

                    zEmbed(
                        () : void => {

                            this.tryToApply( methodName, methodArgs, resolve, reject );

                        }
                    );

                }
            );

            return( promise );

        }

        private promisifyVisibility( methodName: string ) : Promise<void> {

            var promise = new Promise<void>(
                ( resolve: Function, reject: Function ) : void => {

                    this.visibilityQueue.push({
                        resolve: resolve,
                        reject: reject,
                        methodName: methodName
                    });

                    if ( ! this.isLoaded ) {

                        return;

                    }


                    clearTimeout( this.visibilityTimer );

                    this.visibilityTimer = window.setTimeout(
                        () : void => {

                            this.flushVisibilityQueue();

                        },
                        this.visibilityDelay
                    );

                }
            );

            return( promise );

        }


        private tryToApply(
            methodName: string,
            methodArgs: any[],
            resolve: Function,
            reject: Function
        ) : void {

            try {

                zEmbed[ methodName ]( ...methodArgs );
                resolve();

            } catch ( error ) {

                reject( error );

            }

        }

    }
