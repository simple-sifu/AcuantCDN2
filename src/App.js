import React, {Component} from 'react';
import {isMobile} from "react-device-detect";
import CapturePhotoConfirm from './screens/CapturePhotoConfirm';
import "./styles/main.css";

class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            isAcuantSdkLoaded: false
        }
        this.isInitialized = false;
        this.isIntializing = false;
    }


    componentDidMount() {

        if (process.env.REACT_APP_MOBILE_ONLY === 'true') {
            if (!isMobile) {
                this.props.routerHistory.replace('/error/mobileonly');
                document.body.classList.add('mobile-only');
                this.setState({isAcuantSdkLoaded: true});
            } else {
                if (!this.props.config) {
                    this.props.routerHistory.replace('/');
                }
                this.loadScript();
            }
        } else {
            if (!this.props.config) {
                this.props.routerHistory.replace('/');
            }
            this.loadScript();
        }
        
  
    }

    loadScript(){
        // Form absolute URL if not CDN
        function getWorkerURL(url){
            if(url.includes("http")){
                return url;
            } else {
                return new URL(url, window.location.origin).toString();
            }
        }
        // PATHS
        // CDN WORKER URL
        let workerURL = "https://cdn.jsdelivr.net/gh/simple-sifu/Acuant/AcuantImageProcessingWorker.min.js";
        // LOCAL WORKER URL
        // let workerURL = "/AcuantImageProcessingWorker.min.js";

        // REMOTE SDK URL
        let sdkURL = "https://cdn.jsdelivr.net/gh/simple-sifu/Acuant/AcuantJavascriptWebSdk.min.js";
        // LOCAL SDK URL
        // let sdkURL = "/AcuantJavascriptWebSdk.js";


        // Convert worker/CDN URL to ObjectURL
        window.getURL = function(url){
            console.log("url: " + url);
            const content = `importScripts( "${ getWorkerURL(url) }" );`;
            return URL.createObjectURL( new Blob( [ content ], { type: "text/javascript" } ) );
        }
        // Initialize SDK
        window.onAcuantSdkLoaded = function(){
            this.initialize();
        }.bind(this);

        // set path to ObjectURL from CDN response
        let objPath = window.getURL(workerURL);
        window.acuantConfig = {
            path: objPath
        };

        // Retrieve SDK
        const sdk = document.createElement("script");
        sdk.type = "application/javascript";
        sdk.src = sdkURL;
        sdk.async = true;      
        document.body.appendChild(sdk);
    }

    componentDidCatch(error, errorInfo) {
        this.props.routerHistory.push('/error/default')
    }

    initialize(){
        if(!this.isInitialized && !this.isIntializing){
            this.isIntializing = true;
            window.AcuantJavascriptWebSdk.initialize(
                (function(){
                    if(process.env.NODE_ENV === 'development'){
                        return btoa(`${process.env.REACT_APP_USER_NAME}:${process.env.REACT_APP_PASSWORD}`);
                    }
                    else{
                        return process.env.REACT_APP_AUTH_TOKEN;
                    }
                })(), 
                process.env.REACT_APP_ACAS_ENDPOINT,
                {
                    onSuccess:function(){
                        this.isInitialized = true;
                        this.isIntializing = false;
                        this.setState({
                            isAcuantSdkLoaded:true
                        })
                    }.bind(this),

                    onFail: function(){
                        this.isIntializing = false;
                        this.setState({
                            isAcuantSdkLoaded:true
                        })
                    }.bind(this)
                }, 1);
        } 
    }

    render() {
        
        return (
            <div className={'mainContent'}>
                {
                    this.state.isAcuantSdkLoaded && <CapturePhotoConfirm />

                }
            </div>
        );
    }
}

export default App;
