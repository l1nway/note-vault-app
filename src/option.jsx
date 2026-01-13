function Option({ value, id, className, children, disabled }) {
    const ctx = useContext(SelectContext)

    useEffect(() => {
        if (!ctx) return

        const option = {
            id: id ?? makeId(String(value ?? children)),
            value,
            label: children,
            className,
            disabled: !!disabled
        }

        ctx.registerOption(option)
        return () => ctx.unregisterOption(option.id)
    }, [id, value, children, className, disabled])

    return null
}
