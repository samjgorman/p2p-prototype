import * as React from "react"
import { VStack, Heading, Input, FormActions } from "./ui"
import { ModalMenu } from "./Modal"

interface AddFriendModalProps {
	onSubmit: (name: string) => void
	onCancel: () => void
}
interface AddFriendModalState {
	name: string
}
export class AddFriendModal extends React.PureComponent<
	AddFriendModalProps,
	AddFriendModalState
> {
	state: AddFriendModalState = { name: "" }

	render() {
		return (
			<ModalMenu width={400}>
				<VStack padding={40} gap={8}>
					<Heading style={{ marginTop: 0 }}>Add Friend</Heading>
					<Input
						autoFocus={true}
						label="What's your friend's name?"
						value={this.state.name}
						onChange={this.handleChangeName}
						onEnter={this.handleSubmit}
					/>
					<FormActions
						onSubmit={this.handleSubmit}
						onCancel={this.props.onCancel}
					/>
				</VStack>
			</ModalMenu>
		)
	}

	private handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ name: e.currentTarget.value })
	}

	private handleSubmit = () => {
		this.props.onSubmit(this.state.name)
	}
}
