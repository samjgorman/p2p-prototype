import * as React from "react"
import { VStack, Select, SidebarItem, Box, Button } from "./ui"

export interface SidebarProps {
	me: string
	identities: Array<string>
	friends: Array<{ name: string; publicKey?: string }>
	onChangeIdentity?: (identity: string) => void
}

export class Sidebar extends React.PureComponent<SidebarProps> {
	render() {
		const { friends, me, identities } = this.props
		return (
			<VStack gap={8} width={300} height="100vh" borderRight={true}>
				<Box padding={12}>
					<Select
						label="Identities"
						value={me}
						options={identities}
						onChange={this.handleChangeIdentity}
					/>
				</Box>
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

	handleChangeIdentity = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (this.props.onChangeIdentity) {
			this.props.onChangeIdentity(e.currentTarget.value)
		}
	}
}
