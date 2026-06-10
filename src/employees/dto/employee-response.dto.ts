import { ApiProperty } from "@nestjs/swagger";

export class EmployeeResponse {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "Employee Name" })
    fullName: string;

    @ApiProperty({ example: "2000-01-01" })
    birthDate: string;

    @ApiProperty({ example: { id: 1, name: "Manager Name" } })
    manager: {
        id: number | null,
        name: string | null;
    };

    @ApiProperty({ example: { id: 1, name: "Position Name" } })
    position: {
        id: number | null,
        name: string | null;
    };

    @ApiProperty({ example: { id: 1, name: "Department Name" } })
    department: {
        id: number | null,
        name: string | null;
    };
}