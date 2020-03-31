import * as React from "react"

interface VStackProps extends BoxProps {
	align?: "center" | "left" | "right"
	gap?: number | string
	children?: React.ReactNode
}
export function VStack(props: VStackProps) {
	let children = props.children
	if (
		props.gap &&
		props.children &&
		Array.isArray(props.children) &&
		props.children.length > 1
	) {
		const array: Array<React.ReactNode> = []
		for (let i = 0; i < props.children.length; i++) {
			const child = props.children[i]
			array.push(child)
			array.push(<Box key={-i} height={props.gap} />)
		}
		array.pop()
		children = array
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
	children?: React.ReactNode
}
export function HStack(props: HStackProps) {
	let children = props.children
	if (
		props.gap &&
		props.children &&
		Array.isArray(props.children) &&
		props.children.length > 1
	) {
		const array: Array<React.ReactNode> = []
		for (let i = 0; i < props.children.length; i++) {
			const child = props.children[i]
			array.push(child)
			array.push(<Box key={i + "-spacer"} width={props.gap} />)
		}
		array.pop()
		children = array
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
	maxHeight?: string | number
	maxWidth?: string | number
	minHeight?: string | number
	minWidth?: string | number

	padding?: string | number
	paddingTop?: string | number
	paddingBottom?: string | number
	paddingLeft?: string | number
	paddingRight?: string | number

	margin?: string | number
	marginTop?: string | number
	marginBottom?: string | number
	marginLeft?: string | number
	marginRight?: string | number

	border?: boolean
	borderLeft?: boolean
	borderRight?: boolean
	borderTop?: boolean
	borderBottom?: boolean

	stretch?: boolean
	scroll?: boolean
	style?: React.CSSProperties
	children?: React.ReactNode
}
export function Box(props: BoxProps) {
	const Elm = props.element || "div"

	return (
		<Elm
			style={removeUndefinedValues({
				height: props.height,
				width: props.width,
				maxHeight: props.maxHeight,
				maxWidth: props.maxWidth,
				minHeight: props.minHeight,
				minWidth: props.minWidth,
				paddingTop: props.paddingTop,
				paddingBottom: props.paddingBottom,
				paddingLeft: props.paddingLeft,
				paddingRight: props.paddingRight,
				padding: props.padding,
				marginTop: props.marginTop,
				marginBottom: props.marginBottom,
				marginLeft: props.marginLeft,
				marginRight: props.marginRight,
				margin: props.margin,
				flex: props.stretch ? 1 : undefined,
				border: props.border ? "1px solid black" : undefined,
				borderLeft: props.borderLeft ? "1px solid black" : undefined,
				borderRight: props.borderRight ? "1px solid black" : undefined,
				borderTop: props.borderTop ? "1px solid black" : undefined,
				borderBottom: props.borderBottom ? "1px solid black" : undefined,
				overflow: props.scroll ? "auto" : undefined,
				...props.style,
			})}
		>
			{props.children}
		</Elm>
	)
}

function removeUndefinedValues(obj: object) {
	for (const key in obj) {
		if (obj[key] === undefined) {
			delete obj[key]
		}
	}
	return obj
}

interface HeadingProps {
	style?: React.CSSProperties
	children: React.ReactNode
}
export function Heading(props: HeadingProps) {
	return <h1 style={props.style}>{props.children}</h1>
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
	autoFocus?: boolean
	value?: string
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	onEnter?: () => void
}
export class Input extends React.PureComponent<InputProps> {
	render() {
		return (
			<VStack {...this.props} element="label">
				<Box>{this.props.label}</Box>
				<input
					autoFocus={this.props.autoFocus}
					value={this.props.value}
					onChange={this.props.onChange}
					onKeyPress={this.handleKeyPress}
				/>
			</VStack>
		)
	}

	private handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			if (this.props.onEnter) {
				this.props.onEnter()
			}
		}
	}
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
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</VStack>
	)
}

interface PageProps {
	children?: React.ReactNode
}
export function Page({ children }: PageProps) {
	return (
		<VStack align="center" paddingTop={100} paddingBottom={100}>
			<Box width="100%" maxWidth={600}>
				<HStack paddingLeft={12} paddingRight={12}>
					<VStack gap={8} stretch>
						{children}
					</VStack>
				</HStack>
			</Box>
		</VStack>
	)
}

interface FormActionsProps {
	onSubmit?: () => void
	onCancel?: () => void
}
export function FormActions(props: FormActionsProps) {
	return (
		<HStack gap={8}>
			<Button onClick={props.onSubmit}>Submit</Button>
			<PlainButton onClick={props.onCancel}>Cancel</PlainButton>
		</HStack>
	)
}

interface SidebarItemProps {
	selected?: boolean
	children?: React.ReactNode
}
export function SidebarItem({ selected, children }: SidebarItemProps) {
	return <Button>{children}</Button>
}

interface PendingInviteFormProps {
	friend: string
}
export function PendingInviteForm({ friend }: PendingInviteFormProps) {
	return (
		<VStack gap={30} align="center" paddingTop={200}>
			<Input label={`Send ${friend} your invite code:`} />
			<Box>Or</Box>
			<Input label={`Paste ${friend}'s invite code:`} />
		</VStack>
	)
}

interface TopbarProps {
	friend: string
}
export function Topbar({ friend }: TopbarProps) {
	return <Box>{friend}</Box>
}

interface Message {
	from: string
	message: string
	createdAt: number
	receivedAt: number
}
interface MessageProps {
	message: Message
}
export function Message({ message }: MessageProps) {
	return <Box>{message.message}</Box>
}

interface ChatroomProps {
	friend: string
	messages: Array<Message>
}
export function Chatroom({ friend, messages }: ChatroomProps) {
	return (
		<VStack gap={30} align="center">
			<Topbar friend={friend} />
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
