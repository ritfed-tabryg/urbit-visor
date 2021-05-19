// Popup or content script requesting the current status
interface BoolRequest {
    type: "REQ_BOOL_STATUS";
}

// Background script broadcasting current status
interface BoolResponse {
    type: "BOOL_STATUS";
    bool: boolean;
}

// Popup requesting background script for status change
interface BoolToggle {
    type: "TOGGLE_BOOL";
    bool: boolean;
}

export type MessageType = BoolRequest | BoolResponse | BoolToggle;
