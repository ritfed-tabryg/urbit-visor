import { UrbitVisorAction, UrbitVisorRequest, UrbitVisorResponse, BackgroundState, UrbitVisorInternalComms } from "./types/types";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types";




export const Messaging = {
    sendToBackground: async function (request: UrbitVisorInternalComms): Promise<any>{
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage(request, (response) => res(response))
        );
    },
    relayToBackground: async function (request: UrbitVisorRequest): Promise<UrbitVisorResponse> {
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage(request, (response) => res(response))
        );
    },
    callVisor: function ({ app, action, data }: UrbitVisorRequest): Promise<UrbitVisorResponse> {
        return new Promise((res, rej) => {
            const requestId = Math.random().toString(36).substr(2, 9);
            // first add listener for the eventual response
            window.addEventListener('message', function responseHandler(e) {
                console.log(e, "mmm")
                const response = e.data;
                // ignore messages with the wrong request app name, wrong id, or null
                if (response.app !== "urbitVisorResponse" || response.id !== requestId) return;
                // remove listener else they keep stacking up
                window.removeEventListener('message', responseHandler);
                // reject promise if there's an error
                if (response.error) rej(response.error);
                // resolve if fine
                else res(response);
            });
            window.postMessage({ action, data, app, id: requestId }, window.origin);
        });
    },
    createProxyController: () => {
        //listen to function calls from webpage
        window.addEventListener('message', async function (e) {
            const request = e.data;
            if (request && request.app !== "urbitVisor") return;
            request.origin = e.origin;
            // relay message to background script
            Messaging.relayToBackground(request).then((response: UrbitVisorResponse) => {
                // relay back responses to webpage
                window.postMessage({ app: "urbitVisorResponse", id: request.id, status: response.status, response: response.response }, window.origin)
            });
            return;
        });
    }
};