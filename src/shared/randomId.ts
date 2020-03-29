import * as uuid from "uuid"

export function randomId(): string {
	return uuid.v4()
}
