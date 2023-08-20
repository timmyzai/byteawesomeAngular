import { Injectable } from '@angular/core';


@Injectable({
    providedIn: "root"
})
export class EnumHelpersService {
    static getEnumName(enumType: any, enumValue: number): string {
        return enumType[enumValue];
    }
}

