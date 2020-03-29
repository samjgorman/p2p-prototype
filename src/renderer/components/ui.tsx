import * as React from "react"

interface VStackProps extends BoxProps {
	align?: "center" | "left" | "right"
	gap?: number | string
	children?: Array<React.ReactNode>
}
export function VStack(props: VStackProps) {
	let children = props.children
	if (props.gap && props.children && props.children.length > 1) {
		children = []
		for (let i = 0; i < props.children.length; i++) {
			const child = props.children[i]
			children.push(child)
			children.push(<Box key={-i} height={props.gap} />)
		}
		children.pop()
	}
	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: props.align,
			}}
			{...props}
			children={children}
		/>
	)
}

interface HStackProps extends BoxProps {
	// align?: "center" | "left" | "right"
	gap?: number | string
	children?: Array<React.ReactNode>
}
export function HStack(props: HStackProps) {
	let children = props.children
	if (props.gap && props.children) {
		children = []
		for (let i = 0; i < props.children.length; i++) {
			const child = props.children[i]
			children.push(child)
			children.push(<Box key={i + "-spacer"} width={props.gap} />)
		}
		children.pop()
	}
	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				// alignItems: props.align,
			}}
			{...props}
			children={children}
		/>
	)
}

interface BoxProps {
	element?: "div" | "label"
	height?: string | number
	width?: string | number
	stretch?: boolean
	border?: boolean
	scroll?: boolean
	style?: React.CSSProperties
	children?: React.ReactNode
}
export function Box(props: BoxProps) {
	const Elm = props.element || "div"
	return (
		<Elm
			style={{
				height: props.height,
				width: props.width,
				flex: props.stretch ? 1 : undefined,
				border: props.border ? "1px solid black" : undefined,
				overflow: props.scroll ? "auto" : undefined,
				...props.style,
			}}
		>
			{props.children}
		</Elm>
	)
}
interface HeadingProps {
	children: React.ReactNode
}
export function Heading(props: HeadingProps) {
	return <h1>{props.children}</h1>
}

interface ButtonProps {
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	children: React.ReactNode
}
export function Button(props: ButtonProps) {
	return (
		<button style={{ width: "fit-content" }} onClick={props.onClick}>
			{props.children}
		</button>
	)
}

interface PlainButtonProps {
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	children: React.ReactNode
}
export function PlainButton(props: PlainButtonProps) {
	return <button onClick={props.onClick}>{props.children}</button>
}

interface InputProps extends BoxProps {
	label: React.ReactNode
	width?: number | string
	value?: string
	onChange?: React.ChangeEventHandler<HTMLInputElement>
}
export function Input(props: InputProps) {
	return (
		<VStack {...props} element="label">
			<Box>{props.label}</Box>
			<input
				value={props.value}
				onChange={props.onChange}
				style={{ width: props.width }}
			/>
		</VStack>
	)
}

interface UploadProps extends BoxProps {
	label: React.ReactNode
	value?: string
	onChange?: React.ChangeEventHandler<HTMLInputElement>
}
export function Upload(props: UploadProps) {
	return (
		<VStack {...props} element="label">
			<Box>{props.label}</Box>
			<input type="file" value={props.value} onChange={props.onChange} />
		</VStack>
	)
}

interface SelectProps extends BoxProps {
	label: React.ReactNode
	value?: string
	options?: Array<string>
	onChange?: React.ChangeEventHandler<HTMLSelectElement>
}
export function Select(props: SelectProps) {
	return (
		<VStack {...props} element="label">
			<Box>{props.label}</Box>
			<select value={props.value} onChange={props.onChange}>
				{props.options?.map(option => (
					<option value={option} />
				))}
			</select>
		</VStack>
	)
}

export function Page({ children }) {
	return (
		<VStack align="center">
			<Box height={100} />
			<VStack width={600} gap={8}>
				{children}
			</VStack>
			<Box height={100} />
		</VStack>
	)
}

export function Welcome() {
	return (
		<Page>
			<Heading>Welcome to P2P Chat</Heading>
			<Button>Create a new identity</Button>
			<Button>Import identity</Button>
		</Page>
	)
}

export function FormActions() {
	return (
		<HStack gap={8}>
			<Button>Submit</Button>
			<PlainButton>Cancel</PlainButton>
		</HStack>
	)
}

export function NewIdentity() {
	return (
		<Page>
			<Heading>New Identity</Heading>
			<Input label="Name" width="25em" />
			<FormActions />
		</Page>
	)
}

export function ImportIdentity() {
	return (
		<Page>
			<VStack width="25em" gap={14}>
				<Heading>Import Identity</Heading>
				<Input label="Name" />
				<Upload label="Archive" />
				<FormActions />
			</VStack>
		</Page>
	)
}

export function SidebarItem({ selected, children }) {
	return <Button>{children}</Button>
}

export function Sidebar({ friends, me, identities }) {
	return (
		<VStack gap={8} width={300}>
			<Select label="Identities" value={me.name} options={identities} />
			{friends.map(friend => (
				<SidebarItem selected={false}>{friend.name}</SidebarItem>
			))}
			<Box stretch={true} />
			<Button>Add Friend</Button>
		</VStack>
	)
}

export function ChatLayout({ me, friends, children, identities }) {
	return (
		<HStack>
			<Sidebar me={me} friends={friends} identities={identities} />
			<Box stretch={true}>{children}</Box>
		</HStack>
	)
}

export function EmptyChatForm() {
	return (
		<VStack align="center">
			<Box height={200} />
			<Heading>Invite a friend to chat with!</Heading>
			<Button>Add Friend</Button>
		</VStack>
	)
}

export function AddFriendForm() {
	return (
		<VStack>
			<Heading>Add Friend</Heading>
			<Input label="What's your friend's name?" />
			<FormActions />
		</VStack>
	)
}

export function Modal({ children }) {
	return (
		<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
			{children}
		</div>
	)
}

export function ModalMenu({ width, children }) {
	return (
		<Modal>
			<VStack align="center">
				<Box height={250} />
				<Box width={width} border={true}>
					{children}
				</Box>
			</VStack>
		</Modal>
	)
}

export function AddFriendMenu() {
	return (
		<ModalMenu width={400}>
			<AddFriendForm />
		</ModalMenu>
	)
}

export function PendingInviteForm({ friend }) {
	return (
		<VStack gap={30} align="center">
			<Box height={300} />
			<Input label={`Send ${friend.name} your invite code:`} />
			<Box>Or</Box>
			<Input label={`Paste ${friend.name}'s invite code:`} />
		</VStack>
	)
}

export function Topbar() {
	return <Box />
}

export function Message({ message }) {
	return <Box>{message}</Box>
}

export function Chatroom({ friend, messages }) {
	return (
		<VStack gap={30} align="center">
			<Topbar />
			<Box stretch scroll>
				{messages.map(message => (
					<Message message={message} />
				))}
			</Box>
			<Box>
				<Input label={`Send a message`} />
			</Box>
		</VStack>
	)
}
