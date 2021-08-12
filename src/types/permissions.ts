export interface PermissionGraph{
    [key: string]: {
        permissions: Permission[]
    }
}

type UrbitAction = "scry" | "thread" | "poke" | "subscribe"

export interface Permission{
  date: number,
  capability: UrbitAction[]
  caveats: Caveat[]
}

interface Caveat{
    name: string,
    type: string,
    value: any
    
}