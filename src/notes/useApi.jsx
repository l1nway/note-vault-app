const useApi = (token) => {

    const request = async (url, {method = 'GET', body} = {}) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/${url}`, {
            method,
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${token}`
            },
            body: body ? JSON.stringify(body) : undefined
        })
        
    if (!res.ok) {
        let error
        try {
            error = await res.json()
        } catch {
            error = new Error(res.statusText)
        }
        throw error
    }
        return res.json()
    }

    const createNote = (data) =>
        request('notes', {
        method: 'POST',
        body: data
    })

    const getNote = (id) => request(`notes/${id}`)

    const editNote = (id, data) =>
        request(`notes/${id}`, {
        method: 'PATCH',
        body: data
    })

  const getTags = () => request('tags')

  const getCategories = () => request('categories')

  return {createNote, getNote, editNote, getTags, getCategories}
}

export default useApi