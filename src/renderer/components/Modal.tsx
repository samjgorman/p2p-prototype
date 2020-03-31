import * as React from "react"
import { VStack, Box } from "./ui"

interface ModalProps {
	children?: React.ReactNode
}

export function Modal({ children }: ModalProps) {
	return (
		<div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
			{children}
		</div>
	)
}

interface ModalMenuProps {
	width?: string | number
	children?: React.ReactNode
}

export function ModalMenu({ width, children }: ModalMenuProps) {
	return (
		<Modal>
			<VStack align="center" paddingTop={200}>
				<Box width={width} border={true} style={{ background: "white" }}>
					{children}
				</Box>
			</VStack>
		</Modal>
	)
}
