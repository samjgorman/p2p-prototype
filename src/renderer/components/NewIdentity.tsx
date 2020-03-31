import * as React from "react"
import { Page, Heading, Input, FormActions } from "./ui"

interface NewIdentityProps {
	onCancel?: () => void
	onSubmit?: (name: string) => void
}

interface NewIdentityState {
	name: string
}

export class NewIdentity extends React.PureComponent<
	NewIdentityProps,
	NewIdentityState
> {
	state: NewIdentityState = { name: "" }
	render() {
		return (
			<Page>
				<Heading>New Identity</Heading>
				<Input
					value={this.state.name}
					onChange={this.handleChangeName}
					label="Name"
					width="25em"
				/>
				<FormActions
					onCancel={this.props.onCancel}
					onSubmit={this.handleSubmit}
				/>
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
