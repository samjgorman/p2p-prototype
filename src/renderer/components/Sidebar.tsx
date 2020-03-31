import * as React from "react"
import { VStack, SidebarItem, Box, Button } from "./ui"
import { Friend } from "../../main/sqlite"

export interface SidebarProps {
	friendId: string | undefined
	friends: Array<Friend>
}

export class Sidebar extends React.PureComponent<SidebarProps> {
	render() {
		const { friends } = this.props
		return (
			<VStack gap={8} width={300} height="100vh" borderRight={true}>
				<Box padding={12}>
					<Box>Friends</Box>
					{friends.map(friend => (
						<SidebarItem key={friend.name} selected={false}>
							{friend.name}
						</SidebarItem>
					))}
				</Box>
				<Box stretch={true} />
				<Box padding={12}>
					<Button>Add Friend</Button>
				</Box>
			</VStack>
		)
	}
}
