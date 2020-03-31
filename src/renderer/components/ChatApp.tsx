import * as React from "react"
import { HStack, Box, VStack, Heading, Button } from "./ui"
import { SidebarProps, Sidebar } from "./Sidebar"
import { AddFriendModal } from "./AddFriendModal"

interface ChatAppProps extends SidebarProps {
	onAddFriend?: () => void
}

interface ChatAppState {
	showAddFriendModal: boolean
}

export class ChatApp extends React.PureComponent<ChatAppProps, ChatAppState> {
	state: ChatAppState = { showAddFriendModal: false }

	render() {
		const { me, friends, identities } = this.props
		return (
			<HStack>
				<Sidebar me={me} friends={friends} identities={identities} />
				<Box stretch={true} style={{ position: "relative" }}>
					{this.renderContent()}
					{this.renderAddFriendModal()}
				</Box>
			</HStack>
		)
	}

	private renderContent() {
		if (this.props.friends.length === 0) {
			return (
				<VStack align="center" paddingTop={200}>
					<Heading>Invite a friend to chat with!</Heading>
					<Button onClick={this.handleShowAddFriendModal}>Add Friend</Button>
				</VStack>
			)
		} else {
			return "hello"
		}
	}

	private renderAddFriendModal() {
		if (this.state.showAddFriendModal) {
			return (
				<AddFriendModal
					onCancel={this.handleHideAddFriendModal}
					onSubmit={this.handleHideAddFriendModal}
				/>
			)
		}
	}

	private handleShowAddFriendModal = () => {
		this.setState({ showAddFriendModal: true })
	}
	private handleHideAddFriendModal = () => {
		this.setState({ showAddFriendModal: false })
	}
}
