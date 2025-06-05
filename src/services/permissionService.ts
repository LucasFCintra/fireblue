import axios from 'axios'

const API_URL = 'http://192.168.15.30:8687/api'

interface Permission {
  id: number
  user_id: number
  page_id: number
  can_access: boolean
  page: {
    id: number
    name: string
    path: string
    icon: string
  }
}

export const permissionService = {
  async getUserPermissions(): Promise<Permission[]> {
    try {
      const data = {
        id: localStorage.getItem("id")
      }
      const response = await axios.get(`${API_URL}/user/permissions`,{data})
      
      console.log(response.data)
      return response.data

    } catch (error) {
      console.error('Erro ao buscar permissões:', error)
      return []
    }
  }
} 