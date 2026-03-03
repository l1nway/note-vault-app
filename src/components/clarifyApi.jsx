const clarifyApi = async ({entity, action, id, token, payload}) => {
    // different methods are used for different actions; object with correspondences
    const methods = {
        permanent: 'DELETE',
        unarchive: 'PATCH',
        delete: 'DELETE',
        archive: 'PATCH',
        restore: 'PATCH',
        edit: 'PATCH',
        new: 'POST',
    }
    
    // matching a method to a user action
    const method = methods[action]

    const normalizedEntity =
        entity == 'trash' || entity == 'archived'
            ? 'notes'
            : entity

    const noteActionEndpoints = {
        unarchive: 'unarchive',
        permanent: 'permanent',
        restore: 'restore',
        archive: 'archive',
    }

    const url =
        action == 'new'
            ? `http://note-vault-backend-w1uv.onrender.com/api/v1/${normalizedEntity}`
            : normalizedEntity == 'notes' && noteActionEndpoints[action]
                ? `http://note-vault-backend-w1uv.onrender.com/api/v1/notes/${id}/${noteActionEndpoints[action]}`
                : `http://note-vault-backend-w1uv.onrender.com/api/v1/${normalizedEntity}/${id}`


    const res = await fetch(url, {
        method,
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`
        },
        ...(payload && ['POST', 'PATCH', 'PUT'].includes(method)
        ? {body: JSON.stringify(payload)}
        : {})
    })

    if (!res.ok) throw new Error('Server Error')

    const data = await res.json().catch(() => ({}))
    return data
}

export default clarifyApi