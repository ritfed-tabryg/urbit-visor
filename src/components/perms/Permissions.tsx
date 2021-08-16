import * as React from "react";
import { useState } from "react";
import {AES} from "crypto-js";
import {validate} from "../../storage";
import {PermissionRequest} from "../../types/types"


interface PermissionsProps {
    perms: PermissionRequest
    savePerms: (perms: PermissionRequest) => void
}
export default function Permissions(props: PermissionsProps){
    const [pw, setPw] = useState("");
    
    async function onSubmit(){
        const valid = await validate(pw);
        if (valid) props.savePerms(props.perms)
    }
  return(
      <div className="permissions">
      <p>{props.perms.website} is requesting the following permissions: </p>
      <p>{props.perms.permissions}</p>
      <p>Enter your password to grant them</p>
      <form onSubmit={onSubmit}>
          <input onChange={(e) => setPw(e.currentTarget.value)}type="password" />
          <button type="submit">Grant Permissions</button>
      </form>
      </div>
  )
}