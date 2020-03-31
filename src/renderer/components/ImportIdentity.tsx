import * as React from "react"
import { Page, VStack, Heading, Input, Upload, FormActions, Box } from "./ui"

interface ImportIdentityProps {
	onCancel?: () => void
	// TODO: handle upload properly.
	onSubmit?: (name: string) => void
}

interface ImportIdentityState {
	name: string
}

export class ImportIdentity extends React.PureComponent<
	ImportIdentityProps,
	ImportIdentityState
> {
	state: ImportIdentityState = { name: "" }
	render() {
		return (
			<Page>
				<VStack width="25em" gap={14}>
					<Heading>Import Identity</Heading>
					<Box color="warning">This doesnt work yet!</Box>
					<Input
						autoFocus={true}
						value={this.state.name}
						onChange={this.handleChangeName}
						label="Name"
					/>
					<Upload label="Archive" />
					<FormActions
						onCancel={this.props.onCancel}
						onSubmit={this.handleSubmit}
					/>
				</VStack>
			</Page>
		)
	}

	private handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ name: e.currentTarget.value })
	}

	private handleSubmit = () => {
		if (this.props.onSubmit) {
			this.props.onSubmit(this.state.name)
		}
	}
}
