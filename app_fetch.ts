  const refreshLocations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchLocations();
      setLocations(res.locations);
      if (res.warning) {
        setApiWarning(res.warning);
      } else {
        setApiWarning(null);
      }
      if (res.locations.length > 0) {
        if (!selectedLocationId || !res.locations.find(l => l.id === selectedLocationId)) {
          setSelectedLocationId(res.locations[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLocations();
  }, [user, currentView]); // Also re-fetches when view changes occasionally if needed (maybe just user?)
