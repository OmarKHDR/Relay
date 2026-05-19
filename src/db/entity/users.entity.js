import { EntitySchema } from "typeorm";


export const UserSchema = new EntitySchema({
	name: "users", 
	columns: {
		id: {
			primary: true,
			generated: "increment",
		},
		name: {
			type: "text",
		},
		email: {
			type: "text",	
		},
		password: {
			type: "text",
		},
		connected_chairs: {
			type: "simple-json",
		}
	}
})