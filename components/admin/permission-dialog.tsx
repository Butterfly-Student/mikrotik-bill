"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Resource {
	id: number
	name: string
	description: string | null
}

interface Action {
	id: number
	name: string
	description: string | null
}

interface Permission {
	id: number
	name: string
	description: string | null
	resource: Resource
	action: Action
}

interface PermissionDialogProps {
	open: boolean
	onClose: (refresh?: boolean) => void
	permission?: Permission | null
}

export function PermissionDialog({ open, onClose, permission }: PermissionDialogProps) {
	const [loading, setLoading] = useState(false)
	const [resources, setResources] = useState<Resource[]>([])
	const [actions, setActions] = useState<Action[]>([])
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		resourceId: "",
		actionId: "",
	})

	useEffect(() => {
		if (open) {
			fetchResources()
			fetchActions()

			if (permission) {
				setFormData({
					name: permission.name,
					description: permission.description || "",
					resourceId: permission.resource.id.toString(),
					actionId: permission.action.id.toString(),
				})
			} else {
				setFormData({
					name: "",
					description: "",
					resourceId: "",
					actionId: "",
				})
			}
		}
	}, [open, permission])

	const fetchResources = async () => {
		try {
			const response = await fetch("/api/admin/resources")
			if (response.ok) {
				const data = await response.json()
				setResources(data)
			}
		} catch (error) {
			console.error("Failed to fetch resources:", error)
		}
	}

	const fetchActions = async () => {
		try {
			const response = await fetch("/api/admin/actions")
			if (response.ok) {
				const data = await response.json()
				setActions(data)
			}
		} catch (error) {
			console.error("Failed to fetch actions:", error)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const url = permission ? `/api/admin/permissions/${permission.id}` : "/api/admin/permissions"
			const method = permission ? "PUT" : "POST"

			const payload = {
				name: formData.name,
				description: formData.description,
				resourceId: Number.parseInt(formData.resourceId),
				actionId: Number.parseInt(formData.actionId),
			}

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			})

			if (response.ok) {
				onClose(true)
			} else {
				const error = await response.json()
				alert(error.error || "Failed to save permission")
			}
		} catch (error) {
			console.error("Failed to save permission:", error)
			alert("Failed to save permission")
		} finally {
			setLoading(false)
		}
	}

	const handleResourceChange = (resourceId: string) => {
		const resource = resources.find((r) => r.id.toString() === resourceId)
		const action = actions.find((a) => a.id.toString() === formData.actionId)

		setFormData((prev) => ({
			...prev,
			resourceId,
			name: resource && action ? `${resource.name}.${action.name}` : prev.name,
		}))
	}

	const handleActionChange = (actionId: string) => {
		const resource = resources.find((r) => r.id.toString() === formData.resourceId)
		const action = actions.find((a) => a.id.toString() === actionId)

		setFormData((prev) => ({
			...prev,
			actionId,
			name: resource && action ? `${resource.name}.${action.name}` : prev.name,
		}))
	}

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{permission ? "Edit Permission" : "Create Permission"}</DialogTitle>
					<DialogDescription>
						{permission ? "Update permission information" : "Create a new system permission"}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="resource">Resource</Label>
							<Select value={formData.resourceId} onValueChange={handleResourceChange} required>
								<SelectTrigger>
									<SelectValue placeholder="Select a resource" />
								</SelectTrigger>
								<SelectContent>
									{resources.map((resource) => (
										<SelectItem key={resource.id} value={resource.id.toString()}>
											{resource.name.charAt(0).toUpperCase() + resource.name.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="action">Action</Label>
							<Select value={formData.actionId} onValueChange={handleActionChange} required>
								<SelectTrigger>
									<SelectValue placeholder="Select an action" />
								</SelectTrigger>
								<SelectContent>
									{actions.map((action) => (
										<SelectItem key={action.id} value={action.id.toString()}>
											{action.name.charAt(0).toUpperCase() + action.name.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="name">Permission Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="e.g., users.view"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Describe what this permission allows"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onClose()}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{permission ? "Update" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
