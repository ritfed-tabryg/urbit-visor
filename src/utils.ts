export function processName(shipName: string): string{
    if(shipName.length > 30){
        return `${shipName.substring(0,6)}_${shipName.slice(-6)}`
    } else{
        return shipName
    }
}

export function whatShip(shipName: string) : string{
    if (shipName.length > 30) return "comet" 
    if (shipName.length > 14) return "moon" 
    if (shipName.length > 7) return "planet"
    if (shipName.length > 4) return "star"
    else return "galaxy"
}