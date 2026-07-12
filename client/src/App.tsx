import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CalendarDays, Car, Home, Mic, Navigation2 } from "lucide-react";
import { themes } from "./data/themes";
import { vehicles } from "./data/vehicles";
import { destinations, HOME_ORIGIN } from "./data/destinations";
import { getCurrentLocation } from "./lib/geolocation";
import { guides } from "./data/social";
import { nearbyStops, trafficEvents } from "./data/journey";
import { memoryOptions, plannerTemplates } from "./data/plans";
import { color, findDestination, getEta } from "./lib/helpers";
import { deserializeVehicle, safeStorage, serializeVehicle, useStoredState } from "./lib/storage";
import { fetchUserData, pushUserData } from "./lib/account";
import { ListButton, Sheet, Toast } from "./components/ui";
import { HomeScreen } from "./screens/HomeScreen";
import { JourneyScreen } from "./screens/JourneyScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { GarageScreen } from "./screens/GarageScreen";
import { GuidesScreen, GuideDetailSheet, FriendProfileSheet } from "./screens/GuidesScreen";
import { PrivacyScreen } from "./screens/PrivacyScreen";
import { SearchOverlay } from "./sheets/SearchOverlay";
import { DestinationSheet } from "./sheets/DestinationSheet";
import { ShareEtaSheet } from "./sheets/ShareEtaSheet";
import { SimpleListSheet } from "./sheets/SimpleListSheet";
import { ArrivalSheet } from "./sheets/ArrivalSheet";
import { ParkedCarSheet } from "./sheets/ParkedCarSheet";
import { VoiceOverlay } from "./sheets/VoiceOverlay";
import { SettingsSheet } from "./sheets/SettingsSheet";
import { VehicleFormSheet } from "./sheets/VehicleFormSheet";
import { OnboardingOverlay } from "./sheets/OnboardingOverlay";
import { AskVeloraSheet } from "./sheets/AskVeloraSheet";
import { AccountSheet } from "./sheets/AccountSheet";
import { Sparkles } from "lucide-react";
import type {
  Destination,
  DrivingMode,
  EtaShared,
  Friend,
  Guide,
  HomeWork,
  NearbyStop,
  ParkedCar,
  Plan,
  PrivacySettings,
  SavedGuideNotice,
  ThemeName,
  ThemePref,
  TrafficEvent,
  TripMemory,
  UnitPref,
  Vehicle,
} from "./types";

type Tab = "home" | "journey" | "plan" | "garage" | "guides" | "privacy";

const NAV: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "journey", label: "Route", Icon: Navigation2 },
  { id: "plan", label: "Plan", Icon: CalendarDays },
  { id: "garage", label: "Garage", Icon: Car },
  { id: "guides", label: "Guides", Icon: BookOpen },
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [themePref, setThemePref] = useStoredState<ThemePref>("velora:themePref", "auto");
  const autoTheme: ThemeName = (() => {
    const h = new Date().getHours();
    return h >= 19 || h < 7 ? "night" : "day";
  })();
  const theme: ThemeName = themePref === "auto" ? autoTheme : themePref;

  const [onboarded, setOnboarded] = useState(() => safeStorage.get("velora:onboarded") === "1");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [askVeloraOpen, setAskVeloraOpen] = useState(false);
  const [homeWork, setHomeWork] = useStoredState<HomeWork>("velora:homeWork", { home: "", work: "" });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }

  function finishOnboarding() {
    setOnboarded(true);
    safeStorage.set("velora:onboarded", "1");
  }

  const [searchOpen, setSearchOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const origin = userLocation ?? HOME_ORIGIN;

  // Real GPS, replacing the fixed Madrid starting point — falls back to it
  // silently if location access is unavailable or denied, so nothing breaks.
  useEffect(() => {
    getCurrentLocation()
      .then(setUserLocation)
      .catch((err) => console.warn("Location unavailable, using default origin:", err));
  }, []);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceId, setVoiceId] = useStoredState<string>("velora:voiceId", "astra", { serialize: (v) => v, deserialize: (v) => v });
  const [unitPref, setUnitPref] = useStoredState<UnitPref>("velora:unitPref", "mi", { serialize: (v) => v, deserialize: (v) => v as UnitPref });
  const [garageVehicles, setGarageVehicles] = useStoredState<Vehicle[]>("velora:garageVehicles", vehicles, {
    serialize: (list) => JSON.stringify(list.map(serializeVehicle)),
    deserialize: (raw) => JSON.parse(raw).map(deserializeVehicle),
  });
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [parkedSheetOpen, setParkedSheetOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeDestination, setActiveDestination] = useState<Destination>(destinations[0]!);
  const [savedPlaces, setSavedPlaces] = useStoredState<string[]>("velora:savedPlaces", []);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [shareEtaOpen, setShareEtaOpen] = useState(false);
  const [nearbyStopsOpen, setNearbyStopsOpen] = useState(false);
  const [saveGuideOpen, setSaveGuideOpen] = useState(false);
  const [trafficOpen, setTrafficOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [parkedCar, setParkedCar] = useStoredState<ParkedCar | null>("velora:parkedCar", null);
  const [activeVehicleId, setActiveVehicleId] = useStoredState<string>("velora:activeVehicleId", "model-y", { serialize: (v) => v, deserialize: (v) => v });
  const [chosenStop, setChosenStop] = useState<NearbyStop | null>(null);
  const [selectedTraffic, setSelectedTraffic] = useState<TrafficEvent | null>(null);
  const [routePrefs, setRoutePrefs] = useStoredState("velora:routePrefs", { avoidTolls: false, parkingFirst: false });
  const [routeMode, setRouteMode] = useState<DrivingMode>("Express");
  const [etaShared, setEtaShared] = useState<EtaShared | null>(null);
  const [savedGuideNotice, setSavedGuideNotice] = useState<SavedGuideNotice | null>(null);
  const [tripMemory, setTripMemory] = useStoredState<TripMemory | null>("velora:tripMemory", null, {
    serialize: (v) => (v ? v.title : ""),
    deserialize: (raw) => memoryOptions.find((m) => m.title === raw) ?? null,
  });
  const [activePlan, setActivePlan] = useStoredState<Plan | null>("velora:activePlan", null, {
    serialize: (v) => (v ? JSON.stringify({ title: v.title, stops: v.stops }) : ""),
    deserialize: (raw) => {
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { title: string; stops: string[] };
      const template = plannerTemplates.find((p) => p.title === parsed.title);
      if (template) return template;
      return { title: parsed.title, prompt: "Built with Ask Velora", stops: parsed.stops, color: "purple", Icon: Sparkles };
    },
  });
  const [planStopIndex, setPlanStopIndex] = useStoredState<number>("velora:planStopIndex", 0);
  const [privacySettings, setPrivacySettings] = useStoredState<PrivacySettings>("velora:privacySettings", {
    hideHomeWork: true,
    blurParking: true,
    memoryLock: true,
    etaVisibility: "Friends",
  });

  // Accounts are optional: Velora works fully offline/local without one.
  // Signing in syncs the settings/vehicles/etc. above to a real database.
  const [authToken, setAuthToken] = useStoredState<string | null>("velora:authToken", null, { serialize: (v) => v ?? "", deserialize: (v) => v || null });
  const [authEmail, setAuthEmail] = useStoredState<string | null>("velora:authEmail", null, { serialize: (v) => v ?? "", deserialize: (v) => v || null });
  const [accountOpen, setAccountOpen] = useState(false);
  const syncTimer = useRef<number | undefined>(undefined);
  const skipNextSync = useRef(false);

  const syncPayload = useMemo(
    () => ({
      unitPref,
      themePref,
      voiceId,
      homeWork,
      garageVehicles: garageVehicles.map(serializeVehicle),
      savedPlaces,
      parkedCar,
      routePrefs,
      tripMemory,
      activePlan,
      planStopIndex,
      privacySettings,
    }),
    [unitPref, themePref, voiceId, homeWork, garageVehicles, savedPlaces, parkedCar, routePrefs, tripMemory, activePlan, planStopIndex, privacySettings]
  );

  function hydrateFromPayload(payload: Record<string, unknown>) {
    skipNextSync.current = true;
    if (typeof payload.unitPref === "string") setUnitPref(payload.unitPref as UnitPref);
    if (typeof payload.themePref === "string") setThemePref(payload.themePref as ThemePref);
    if (typeof payload.voiceId === "string") setVoiceId(payload.voiceId);
    if (payload.homeWork) setHomeWork(payload.homeWork as HomeWork);
    if (Array.isArray(payload.garageVehicles) && payload.garageVehicles.length > 0) {
      setGarageVehicles((payload.garageVehicles as Omit<Vehicle, "Icon">[]).map(deserializeVehicle));
    }
    if (Array.isArray(payload.savedPlaces)) setSavedPlaces(payload.savedPlaces as string[]);
    if ("parkedCar" in payload) setParkedCar(payload.parkedCar as ParkedCar | null);
    if (payload.routePrefs) setRoutePrefs(payload.routePrefs as typeof routePrefs);
    if ("tripMemory" in payload) setTripMemory(payload.tripMemory as TripMemory | null);
    if ("activePlan" in payload) setActivePlan(payload.activePlan as Plan | null);
    if (typeof payload.planStopIndex === "number") setPlanStopIndex(payload.planStopIndex);
    if (payload.privacySettings) setPrivacySettings(payload.privacySettings as PrivacySettings);
  }

  async function handleSignedIn(token: string, email: string) {
    setAuthToken(token);
    setAuthEmail(email);
    try {
      const payload = await fetchUserData(token);
      if (Object.keys(payload).length > 0) {
        hydrateFromPayload(payload);
        showToast(`Synced from your account`);
      } else {
        await pushUserData(token, syncPayload);
        showToast(`Signed in as ${email}`);
      }
    } catch (err) {
      console.error("Initial account sync failed:", err);
    }
  }

  function handleSignOut() {
    setAuthToken(null);
    setAuthEmail(null);
    showToast("Signed out");
  }

  // Pulls the latest synced data once on load if already signed in, so a
  // change made on another device shows up here too.
  useEffect(() => {
    if (!authToken) return;
    fetchUserData(authToken)
      .then((payload) => {
        if (Object.keys(payload).length > 0) hydrateFromPayload(payload);
      })
      .catch((err) => {
        console.error("Account refresh failed:", err);
        if (err instanceof Error && err.message.toLowerCase().includes("token")) {
          setAuthToken(null);
          setAuthEmail(null);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced push of the consolidated syncable state whenever it changes,
  // as long as an account is signed in. Skips the push that would otherwise
  // immediately follow a hydrate-from-server (nothing new to send back).
  useEffect(() => {
    if (!authToken) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      pushUserData(authToken, syncPayload).catch((err) => console.error("Sync failed:", err));
    }, 1200);
    return () => window.clearTimeout(syncTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, syncPayload]);

  const t = themes[theme];
  const activeVehicle = garageVehicles.find((v) => v.id === activeVehicleId) ?? garageVehicles[0] ?? vehicles[0]!;
  const currentEta = getEta(activeDestination, "Express", routePrefs, selectedTraffic);

  function startRoute(destination: Destination) {
    setActiveDestination(destination);
    setSelectedDestination(null);
    setSelectedGuide(null);
    setSelectedFriend(null);
    setSearchOpen(false);
    setArrivalOpen(false);
    setChosenStop(null);
    setSelectedTraffic(null);
    setTab("journey");
  }

  function startPlan(plan: Plan) {
    const firstStop = findDestination(plan.stops[0]!);
    setActiveDestination(firstStop);
    setActivePlan(plan);
    setPlanStopIndex(0);
    setSelectedTraffic(null);
    setChosenStop(null);
    setTab("journey");
  }

  function continueToNextStop() {
    if (!activePlan) return;
    const nextIndex = planStopIndex + 1;
    if (nextIndex >= activePlan.stops.length) return;
    setPlanStopIndex(nextIndex);
    setActiveDestination(findDestination(activePlan.stops[nextIndex]!));
    setArrivalOpen(false);
    setChosenStop(null);
    setSelectedTraffic(null);
    showToast(`Next stop: ${activePlan.stops[nextIndex]}`);
  }

  function toggleSave(name: string) {
    const removing = savedPlaces.includes(name);
    setSavedPlaces((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
    showToast(removing ? "Removed from saved places" : "Saved to your places");
  }

  function saveParkedCar() {
    setParkedCar({
      location: privacySettings.blurParking ? "Garage saved privately" : "Level 3 · Section B12",
      walk: "2 min walk",
    });
    setArrivalOpen(false);
    const isLastPlanStop = Boolean(activePlan && planStopIndex >= activePlan.stops.length - 1);
    if (isLastPlanStop) {
      setActivePlan(null);
      setPlanStopIndex(0);
    }
    setTab("home");
    showToast(activePlan && !isLastPlanStop ? "Parking spot saved" : "Parking spot saved · trip complete");
  }

  function openDestination(destination: Destination) {
    setSelectedGuide(null);
    setSelectedFriend(null);
    setSearchOpen(false);
    setSelectedDestination(destination);
  }

  function openFriend(friend: Friend) {
    setSelectedGuide(null);
    setSearchOpen(false);
    setSelectedFriend(friend);
  }

  function shareEta(friend: Friend) {
    setEtaShared({ friend: friend.name, place: activeDestination.name });
    setShareEtaOpen(false);
    setTab("home");
    showToast(`ETA shared with ${friend.name}`);
  }

  function addStop(stop: NearbyStop) {
    setChosenStop(stop);
    setNearbyStopsOpen(false);
  }

  function saveToGuide(guide: Guide) {
    setSavedGuideNotice({ guide: guide.title, place: activeDestination.name });
    setSaveGuideOpen(false);
    setTab("home");
    showToast(`Added to ${guide.title}`);
  }

  function selectTraffic(event: TrafficEvent) {
    setSelectedTraffic(event);
    setTrafficOpen(false);
  }

  function autoDetectTraffic() {
    const event = trafficEvents[Math.floor(Math.random() * trafficEvents.length)]!;
    setSelectedTraffic(event);
    showToast(`Velora detected ${event.name.toLowerCase()}`);
  }

  function saveMemory(memory: TripMemory) {
    setTripMemory(memory);
    setMemoryOpen(false);
    setTab("home");
    showToast("Velora will remember that");
  }

  function addRegisteredVehicle(vehicle: Vehicle) {
    setGarageVehicles((current) => [...current, vehicle]);
    setActiveVehicleId(vehicle.id);
    showToast(`${vehicle.name} added to Garage`);
  }

  function removeVehicle(vehicleId: string) {
    setGarageVehicles((current) => {
      if (current.length <= 1) {
        showToast("Keep at least one car in Garage");
        return current;
      }

      const next = current.filter((vehicle) => vehicle.id !== vehicleId);
      if (activeVehicleId === vehicleId && next[0]) {
        setActiveVehicleId(next[0].id);
      }

      showToast("Car removed from Garage");
      return next;
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 26,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif",
      }}
    >
      <div>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ color: theme === "night" ? "#c4b5fd" : "#4c1d95", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600 }}>Velora</div>
          <div style={{ color: theme === "night" ? "#94a3b8" : "#475569", fontSize: 14, marginTop: 5, fontWeight: 600 }}>Smarter routes. Better stops. Less stress.</div>
        </div>

        <div style={{ background: theme === "night" ? "#020617" : "#dbe4ee", borderRadius: 46, padding: 10 }}>
          <div
            style={{
              width: "min(90vw, 360px)",
              height: "min(78vh, 740px)",
              minHeight: 620,
              background: t.phone,
              borderRadius: 38,
              overflow: "hidden",
              position: "relative",
              border: `1px solid ${t.border}`,
            }}
          >
            <div style={{ position: "absolute", top: 14, left: 24, right: 24, zIndex: 20, display: "flex", justifyContent: "space-between", color: t.text, fontSize: 12, fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace", pointerEvents: "none" }}>
              <span>9:41</span>
              <span>••• ▯</span>
            </div>

            <div style={{ height: "100%", overflow: "hidden" }}>
              {tab === "home" && (
                <HomeScreen
                  t={t}
                  openSearch={() => setSearchOpen(true)}
                  goJourney={() => setTab("journey")}
                  activeDestination={activeDestination}
                  parkedCar={parkedCar}
                  openParkedCar={() => setParkedSheetOpen(true)}
                  openSettings={() => setSettingsOpen(true)}
                  openAskVelora={() => setAskVeloraOpen(true)}
                  openDestination={openDestination}
                  activeVehicle={activeVehicle}
                  etaShared={etaShared}
                  savedGuideNotice={savedGuideNotice}
                  tripMemory={tripMemory}
                  trafficNotice={selectedTraffic}
                  privacySettings={privacySettings}
                  activePlan={activePlan}
                  planStopIndex={planStopIndex}
                />
              )}

              {tab === "journey" && (
                <JourneyScreen
                  t={t}
                  theme={theme}
                  activeDestination={activeDestination}
                  activeVehicle={activeVehicle}
                  openArrival={() => setArrivalOpen(true)}
                  routePrefs={routePrefs}
                  setRoutePrefs={setRoutePrefs}
                  openShareEta={() => setShareEtaOpen(true)}
                  openNearbyStops={() => setNearbyStopsOpen(true)}
                  openSaveToGuide={() => setSaveGuideOpen(true)}
                  openTraffic={() => setTrafficOpen(true)}
                  openMemory={() => setMemoryOpen(true)}
                  chosenStop={chosenStop}
                  selectedTraffic={selectedTraffic}
                  autoDetectTraffic={autoDetectTraffic}
                  unitPref={unitPref}
                  tripMemory={tripMemory}
                  activePlan={activePlan}
                  mode={routeMode}
                  setMode={setRouteMode}
                  voiceId={voiceId}
                  origin={origin}
                />
              )}

              {tab === "plan" && <PlanScreen t={t} activePlan={activePlan} planStopIndex={planStopIndex} setActivePlan={setActivePlan} startPlan={startPlan} openDestination={openDestination} origin={origin} />}

              {tab === "garage" && (
                <GarageScreen t={t} vehicles={garageVehicles} activeVehicle={activeVehicle} setActiveVehicleId={setActiveVehicleId} openAddVehicle={() => setAddVehicleOpen(true)} removeVehicle={removeVehicle} unitPref={unitPref} />
              )}

              {tab === "guides" && <GuidesScreen t={t} openGuide={(guide) => setSelectedGuide(guide)} openFriend={openFriend} />}

              {tab === "privacy" && (
                <PrivacyScreen
                  t={t}
                  privacySettings={privacySettings}
                  setPrivacySettings={setPrivacySettings}
                  tripMemory={tripMemory}
                  parkedCar={parkedCar}
                  chosenStop={chosenStop}
                  selectedTraffic={selectedTraffic}
                  activePlan={activePlan}
                />
              )}
            </div>

            <button
              onClick={() => setVoiceOpen(true)}
              style={{ position: "absolute", right: 18, bottom: 102, zIndex: 45, width: 56, height: 56, borderRadius: "50%", border: "none", background: t.purple, color: "white", cursor: "pointer", display: "grid", placeItems: "center" }}
            >
              <Mic size={23} />
            </button>

            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                bottom: 14,
                height: 76,
                background: t.glass,
                backdropFilter: "blur(18px)",
                border: `1px solid ${t.border}`,
                borderRadius: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                zIndex: 40,
              }}
            >
              {NAV.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{ border: "none", background: "transparent", color: tab === id ? t.purple : t.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 9, minWidth: 48, padding: 4 }}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {searchOpen && <SearchOverlay t={t} close={() => setSearchOpen(false)} selectDestination={openDestination} openFriend={openFriend} savedPlaces={savedPlaces} origin={origin} />}

            {selectedDestination && (
              <DestinationSheet t={t} destination={selectedDestination} close={() => setSelectedDestination(null)} startRoute={startRoute} saved={savedPlaces.includes(selectedDestination.name)} toggleSave={toggleSave} activeVehicle={activeVehicle} />
            )}

            {selectedGuide && <GuideDetailSheet t={t} guide={selectedGuide} close={() => setSelectedGuide(null)} openDestination={openDestination} openFriend={openFriend} />}

            {selectedFriend && <FriendProfileSheet t={t} friend={selectedFriend} close={() => setSelectedFriend(null)} openDestination={openDestination} />}

            {arrivalOpen && (
              <ArrivalSheet t={t} destination={activeDestination} close={() => setArrivalOpen(false)} saveParkedCar={saveParkedCar} activePlan={activePlan} planStopIndex={planStopIndex} continueToNextStop={continueToNextStop} />
            )}

            {shareEtaOpen && <ShareEtaSheet t={t} destination={activeDestination} eta={currentEta} close={() => setShareEtaOpen(false)} shareEta={shareEta} privacySettings={privacySettings} />}

            {nearbyStopsOpen && <SimpleListSheet t={t} close={() => setNearbyStopsOpen(false)} title="Nearby stops" subtitle="Add a stop without leaving navigation." items={nearbyStops} onSelect={addStop} />}

            {saveGuideOpen && <SimpleListSheet t={t} close={() => setSaveGuideOpen(false)} title="Save to City Guide" subtitle={`Add ${activeDestination.name} to one of your guides.`} items={guides} onSelect={saveToGuide} />}

            {trafficOpen && (
              <Sheet t={t} close={() => setTrafficOpen(false)} title="Traffic Intelligence" subtitle="See what Velora detects and choose how to respond.">
                {selectedTraffic && (
                  <button
                    onClick={() => {
                      setSelectedTraffic(null);
                      setTrafficOpen(false);
                    }}
                    style={{ marginBottom: 14, width: "100%", border: `1px solid ${t.green}`, background: `${t.green}18`, color: t.green, borderRadius: 15, padding: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Clear traffic adjustment
                  </button>
                )}

                <div style={{ display: "grid", gap: 10 }}>
                  {trafficEvents.map((event) => (
                    <ListButton key={event.name} t={t} color={color(t, event.color)} Icon={event.Icon} title={event.name} detail={`${event.detail} · ${event.impact}`} onClick={() => selectTraffic(event)} />
                  ))}
                </div>
              </Sheet>
            )}

            {memoryOpen && <SimpleListSheet t={t} close={() => setMemoryOpen(false)} title="Trip Memory" subtitle="Tell Velora what to remember for future recommendations." items={memoryOptions} onSelect={saveMemory} />}

            {parkedSheetOpen && parkedCar && <ParkedCarSheet t={t} parkedCar={parkedCar} close={() => setParkedSheetOpen(false)} clearParkedCar={() => setParkedCar(null)} />}

            {askVeloraOpen && (
              <AskVeloraSheet
                t={t}
                close={() => setAskVeloraOpen(false)}
                destination={activeDestination}
                vehicle={activeVehicle}
                routePrefs={routePrefs}
                setRoutePrefs={setRoutePrefs}
                selectedTraffic={selectedTraffic}
                tripMemory={tripMemory}
                activePlan={activePlan}
                unitPref={unitPref}
                openDestination={openDestination}
                goJourney={() => setTab("journey")}
                goGarage={() => setTab("garage")}
                openAIScore={() => setTab("journey")}
              />
            )}

            {settingsOpen && (
              <SettingsSheet
                t={t}
                close={() => setSettingsOpen(false)}
                themePref={themePref}
                setThemePref={setThemePref}
                voiceId={voiceId}
                setVoiceId={setVoiceId}
                vehicles={garageVehicles}
                activeVehicleId={activeVehicleId}
                setActiveVehicleId={setActiveVehicleId}
                unitPref={unitPref}
                setUnitPref={setUnitPref}
                homeWork={homeWork}
                setHomeWork={setHomeWork}
                goPrivacy={() => {
                  setSettingsOpen(false);
                  setTab("privacy");
                }}
                openAddVehicle={() => setAddVehicleOpen(true)}
                tripMemory={tripMemory}
                activePlan={activePlan}
                routePrefs={routePrefs}
                authEmail={authEmail}
                openAccount={() => setAccountOpen(true)}
              />
            )}

            {accountOpen && <AccountSheet t={t} close={() => setAccountOpen(false)} authEmail={authEmail} onSignedIn={handleSignedIn} onSignOut={handleSignOut} />}

            {addVehicleOpen && <VehicleFormSheet t={t} close={() => setAddVehicleOpen(false)} addVehicle={addRegisteredVehicle} />}

            {voiceOpen && <VoiceOverlay t={t} close={() => setVoiceOpen(false)} voiceId={voiceId} setVoiceId={setVoiceId} />}

            <Toast t={t} toast={toast} />

            {!onboarded && (
              <OnboardingOverlay
                t={t}
                finish={finishOnboarding}
                vehicles={garageVehicles}
                activeVehicleId={activeVehicleId}
                setActiveVehicleId={setActiveVehicleId}
                voiceId={voiceId}
                setVoiceId={setVoiceId}
                homeWork={homeWork}
                setHomeWork={setHomeWork}
                openAddVehicle={() => setAddVehicleOpen(true)}
                unitPref={unitPref}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
