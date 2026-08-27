export const toolRegistry = {
    calculator
}

export function calculator(a: number, b: number, op: string) {
    if(op === "add") {
        return a+b;
    }

    else if(op === "multiply"){
        return a*b;
    }

    else if(op === "subtract"){
        return a-b;
    }

    else if(op === "divide") {
        if(b === 0){
            return "Cannot divide by 0";
        }
        return a/b;
    }

    else {
        return "Invalid operation entered by the user"
    }
}