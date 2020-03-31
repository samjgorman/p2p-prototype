import * as React from "react"
import { VStack, Select, SidebarItem, Box, Button } from "./ui"

export interface SidebarProps {
	me: string
	identities: Array<string>
	friends: Array<string>
	onChangeIdentity?: (identity: string) => void
}

export class Sidebar extends React.PureComponent<SidebarProps> {
	render() {
		const { friends, me, identities } = this.props
		return (
			<VStack gap={8} width={300} height="100vh">
				<Box padding={12}>
					<Select
						label="Identities"
						value={me}
						options={identities}
						onChange={this.handleChangeIdentity}
					/>
				</Box>
				{friends.map(friend => (
					<SidebarItem key={friend} selected={false}>
						{friend}
					</SidebarItem>
				))}
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
