export function processName(shipName: string): string{
    if(shipName.length > 30){
        return `${shipName.substring(0,6)}_${shipName.slice(-6)}`
    }else if(shipName.length > 14){
        return shipName.slice(-13).replace("-", "^")
    } else{
        return shipName
    }
}