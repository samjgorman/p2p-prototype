import * as React from "react"
import { HStack, Box, VStack, Heading, Button } from "./ui"
import { SidebarProps, Sidebar } from "./Sidebar"

interface ChatAppProps extends SidebarProps {
	onAddFriend?: () => void
}

export class ChatApp extends React.PureComponent<ChatAppProps> {
	render() {
		const { me, friends, identities } = this.props
		return (
			<HStack>
				<Sidebar me={me} friends={friends} identities={identities} />
				<Box stretch={true}>{this.renderContent()}</Box>
			</HStack>
		)
	}

	private renderContent() {
		if (this.props.friends.length === 0) {
			return (
				<VStack align="center" paddingTop={200}>
					<Heading>Invite a friend to chat with!</Heading>
					<Button onClick={this.props.onAddFriend}>Add Friend</Button>
				</VStack>
			)
		} else {
			return "hello"
		}
	}
}
