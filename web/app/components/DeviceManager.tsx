'use client'

import { useState, useEffect } from 'react'
import { Device } from '../types'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCog } from 'react-icons/fa'

interface DeviceManagerProps {
    isOpen: boolean
    onClose: () => void
}

interface FormData {
    id: string
    name: string
    description: string
    lat: number
    lng: number
}

export default function DeviceManager({ isOpen, onClose }: DeviceManagerProps) {
    const [devices, setDevices] = useState<Device[]>([])
    const [isAddingDevice, setIsAddingDevice] = useState<boolean>(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormData>({
        id: '',
        name: '',
        description: '',
        lat: -23.5505,
        lng: -46.6333,
    })

    // Carregar dispositivos do localStorage
    useEffect(() => {
        const savedDevices: string | null = localStorage.getItem('devices')
        if (savedDevices) {
            try {
                const parsedDevices: Device[] = JSON.parse(savedDevices)
                setDevices(parsedDevices)
            } catch (e: unknown) {
                console.error('Erro ao carregar dispositivos:', e)
            }
        }
    }, [])

    // Salvar dispositivos no localStorage
    const saveDevices = (newDevices: Device[]): void => {
        localStorage.setItem('devices', JSON.stringify(newDevices))
        setDevices(newDevices)
    }

    const handleAddDevice = (): void => {
        if (!formData.id || !formData.name) {
            alert('ID e Nome são obrigatórios!')
            return
        }

        const newDevice: Device = {
            id: formData.id,
            name: formData.name,
            description: formData.description,
            location: { lat: formData.lat, lng: formData.lng },
            addedAt: new Date().toISOString(),
        }

        const updatedDevices: Device[] = [...devices, newDevice]
        saveDevices(updatedDevices)
        resetForm()
        setIsAddingDevice(false)
    }

    const handleUpdateDevice = (): void => {
        if (!editingId) return

        const updatedDevices: Device[] = devices.map((device: Device) =>
            device.id === editingId
                ? {
                      ...device,
                      name: formData.name,
                      description: formData.description,
                      location: { lat: formData.lat, lng: formData.lng },
                  }
                : device
        )

        saveDevices(updatedDevices)
        resetForm()
        setEditingId(null)
    }

    const handleDeleteDevice = (id: string): void => {
        if (confirm('Deseja realmente excluir este dispositivo?')) {
            const filteredDevices: Device[] = devices.filter(
                (d: Device) => d.id !== id
            )
            saveDevices(filteredDevices)
        }
    }

    const startEdit = (device: Device): void => {
        const editFormData: FormData = {
            id: device.id,
            name: device.name,
            description: device.description || '',
            lat: device.location.lat,
            lng: device.location.lng,
        }
        setFormData(editFormData)
        setEditingId(device.id)
        setIsAddingDevice(false)
    }

    const resetForm = (): void => {
        const defaultFormData: FormData = {
            id: '',
            name: '',
            description: '',
            lat: -23.5505,
            lng: -46.6333,
        }
        setFormData(defaultFormData)
    }

    const cancelEdit = (): void => {
        resetForm()
        setEditingId(null)
        setIsAddingDevice(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <FaCog className="text-blue-500" />
                        Gerenciar Dispositivos
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add Button */}
                    {!isAddingDevice && !editingId && (
                        <button
                            onClick={() => setIsAddingDevice(true)}
                            className="w-full mb-4 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <FaPlus /> Adicionar Novo Dispositivo
                        </button>
                    )}

                    {/* Form */}
                    {(isAddingDevice || editingId) && (
                        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                                {editingId
                                    ? 'Editar Dispositivo'
                                    : 'Novo Dispositivo'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        ID do Dispositivo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                id: e.target.value,
                                            })
                                        }
                                        disabled={!!editingId}
                                        placeholder="Ex: A1B2C3D4E5F6"
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">
                                        MAC Address do ESP32 (sem ':')
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Nome do Dispositivo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Ex: Máquina de Corte 01"
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLTextAreaElement>
                                        ) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Descrição opcional do dispositivo"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={formData.lat}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setFormData({
                                                    ...formData,
                                                    lat:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={formData.lng}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setFormData({
                                                    ...formData,
                                                    lng:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={
                                            editingId
                                                ? handleUpdateDevice
                                                : handleAddDevice
                                        }
                                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaSave />{' '}
                                        {editingId ? 'Salvar' : 'Adicionar'}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="flex-1 px-4 py-2 bg-zinc-500 text-white rounded-lg hover:bg-zinc-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Device List */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            Dispositivos Cadastrados ({devices.length})
                        </h3>

                        {devices.length === 0 ? (
                            <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                                Nenhum dispositivo cadastrado ainda.
                            </p>
                        ) : (
                            devices.map((device) => (
                                <div
                                    key={device.id}
                                    className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                                                {device.name}
                                            </h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                                ID: {device.id}
                                            </p>
                                            {device.description && (
                                                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                                                    {device.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                                                📍 Lat:{' '}
                                                {device.location.lat.toFixed(6)}
                                                , Lng:{' '}
                                                {device.location.lng.toFixed(6)}
                                            </p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-600">
                                                Adicionado em:{' '}
                                                {new Date(
                                                    device.addedAt
                                                ).toLocaleString('pt-BR')}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() =>
                                                    startEdit(device)
                                                }
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteDevice(
                                                        device.id
                                                    )
                                                }
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        💡 <strong>Dica:</strong> O ID do dispositivo é gerado
                        automaticamente pelo ESP32 baseado no MAC Address. Você
                        pode encontrá-lo nos logs do Serial Monitor.
                    </p>
                </div>
            </div>
        </div>
    )
}
