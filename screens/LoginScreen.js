import React, { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import simpsonsData from "../assets/SIMPSONS_TV_ART/simpsons.js";
import { seasonImages, chapterImages } from "../assets/SIMPSONS_TV_ART/images.js";

const { width, height } = Dimensions.get("window");
const SEASON_CARD_WIDTH = 190;

const ITEM_WIDTH = width * 0.72;
const ITEM_SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

export default function LibraryScreen() {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const verticalScroll = useRef(new Animated.Value(0)).current;
  const horizontalScroll = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchedEpisodes, setWatchedEpisodes] = useState({});

  useEffect(() => {
    loadWatchedEpisodes();
  }, []);

  const loadWatchedEpisodes = async () => {
    try {
      const stored = await AsyncStorage.getItem("watchedEpisodes");
      if (stored !== null) {
        setWatchedEpisodes(JSON.parse(stored));
      }
    } catch (error) {
      console.log("Error loading watched episodes", error);
    }
  };

  useEffect(() => {
    saveWatchedEpisodes();
  }, [watchedEpisodes]);

  const saveWatchedEpisodes = async () => {
    try {
      await AsyncStorage.setItem(
        "watchedEpisodes",
        JSON.stringify(watchedEpisodes)
      );
    } catch (error) {
      console.log("Error saving watched episodes", error);
    }
  };
  const seasons = (simpsonsData?.seasons || []).map((s, i) => ({
    id: s.id?.toString() || i.toString(),
    title: s.title || "Sin título",
    cover: seasonImages[s.image] || require("../assets/adaptive-icon.png"),
    avgColor: s.avgColor || "#000",
    episodes: (s.episodes || []).map((e, j) => ({
      ...e,
      id: e.id?.toString() || j.toString(),
      imageResolved: chapterImages[e.image] || require("../assets/icon.png"),
      episodeNumber: e.episodeNumber || j + 1,
      title: e.title || "Sin título",
      duration: e.duration || "Desconocida",
      synopsis: e.synopsis || "Sin sinopsis",
      airDate: e.airDate || "Desconocida",
    })),
  }));

  const toggleWatched = (seasonId, episodeId) => {
    const key = `${seasonId}_${episodeId}`;

    setWatchedEpisodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  const openSeason = (season, index) => {
    setCurrentIndex(index);
    setSelectedSeason(season);
  };

  const closeSeason = () => {
    setSelectedSeason(null);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
    }, 50);
  };

  const openEpisode = (episode) => setSelectedEpisode(episode);
  const closeEpisode = () => setSelectedEpisode(null);

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={styles.cloudLarge}>
        <View style={styles.cloudBubbleBig} />
        <View style={styles.cloudBubbleMid} />
        <View style={styles.cloudBubbleSmall} />
      </View>
      <View style={styles.cloudMedium}>
        <View style={styles.cloudBubbleBig} />
        <View style={styles.cloudBubbleMid} />
        <View style={styles.cloudBubbleSmall} />
      </View>
      <View style={styles.cloudSmall}>
        <View style={styles.cloudBubbleMid} />
        <View style={styles.cloudBubbleSmall} />
      </View>
      <View style={styles.overlay} />

      {!selectedSeason && (
        <Animated.FlatList
          showsVerticalScrollIndicator={false}
          ref={flatListRef}
          data={seasons}
          keyExtractor={(item) => item.id}
          initialScrollIndex={currentIndex}
          getItemLayout={(data, index) => ({
            length: 260,
            offset: 260 * index,
            index,
          })}
          contentContainerStyle={{
            paddingTop: height * 0.25,
            paddingBottom: height * 0.35,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: verticalScroll } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * 260,
              index * 260,
              (index + 1) * 260,
            ];
            const scale = verticalScroll.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: "clamp",
            });
            const translateY = verticalScroll.interpolate({
              inputRange,
              outputRange: [160, 140, 160],
              extrapolate: "clamp",
            });
            const overlayOpacity = verticalScroll.interpolate({
              inputRange,
              outputRange: [0.55, 0, 0.55],
              extrapolate: "clamp",
            });

            return (
              <TouchableOpacity
                onPress={() => openSeason(item, index)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.stackCard,
                    {
                      transform: [{ scale }, { translateY }],
                    }
                  ]}
                >
                  <Image
                    source={item.cover}
                    style={styles.stackImage}
                    resizeMode="cover"
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: "black", opacity: overlayOpacity, borderRadius: 20 },
                    ]}
                  />
                  <Text style={styles.stackTitle}>{item.title}</Text>
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      )}


      {selectedSeason && (
        <View style={styles.bookDetail}>
          <Text style={styles.detailTitle}>{selectedSeason.title}</Text>

          <Animated.FlatList
            data={selectedSeason.episodes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: (width - SNAP_INTERVAL - 45) / 2,
            }}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: horizontalScroll } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 1) * SNAP_INTERVAL,
                index * SNAP_INTERVAL,
                (index + 1) * SNAP_INTERVAL,
              ];

              const scale = horizontalScroll.interpolate({
                inputRange,
                outputRange: [0.85, 1, 0.85],
                extrapolate: "clamp",
              });

              const opacity = horizontalScroll.interpolate({
                inputRange,
                outputRange: [0.6, 1, 0.6],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  style={{
                    width: ITEM_WIDTH,
                    marginHorizontal: ITEM_SPACING / 2,
                    transform: [{ scale }],
                    opacity,
                  }}
                >
                  <TouchableOpacity onPress={() => openEpisode(item)}>
                    <View style={styles.chapterContainer}>
                      <Image
                        source={item.imageResolved}
                        style={styles.chapterImage}
                        resizeMode="cover"
                      />

                      {/* ICONO VISTO */}
                      <TouchableOpacity
                        style={styles.watchedIcon}
                        onPress={() => toggleWatched(selectedSeason.id, item.id)}                      >
                        <Ionicons
                          name={
                            watchedEpisodes[`${selectedSeason.id}_${item.id}`]
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={28}
                          color={
                            watchedEpisodes[`${selectedSeason.id}_${item.id}`]
                              ? "#22D3EE"
                              : "#FFF"
                          }
                        />
                      </TouchableOpacity>

                      <Text style={styles.chapterOverlayTitle}>
                        {item.episodeNumber}. {item.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={closeSeason}>
            <Ionicons name="arrow-back-circle" size={40} color="#59ecff" />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={!!selectedEpisode} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedEpisode && (
              <>
                <Image
                  source={selectedEpisode.imageResolved}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.chapterText}>
                  {selectedEpisode.episodeNumber}. {selectedEpisode.title}
                </Text>
                <Text style={styles.chapterSubText}>
                  Duración: {selectedEpisode.duration} min
                </Text>
                <Text style={styles.chapterSubText}>
                  Fecha emisión: {selectedEpisode.airDate || "Desconocida"}
                </Text>
                <Text style={styles.synopsisText}>{selectedEpisode.synopsis}</Text>

                <TouchableOpacity style={styles.playButton}>
                  <Ionicons name="play" size={18} color="#1F2937" style={styles.playIcon} />
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCloseButton} onPress={closeEpisode}>
                  <Ionicons name="close-circle" size={40} color="#59ecff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#70B8FF" },
  background: { position: "absolute", width, height, backgroundColor: "#69B7FF" },
  cloudLarge: { position: "absolute", top: height * 0.08, left: -40, width: 260, height: 120, flexDirection: "row", alignItems: "flex-end" },
  cloudMedium: { position: "absolute", top: height * 0.2, right: -50, width: 220, height: 100, flexDirection: "row", alignItems: "flex-end" },
  cloudSmall: { position: "absolute", top: height * 0.35, left: width * 0.2, width: 160, height: 80, flexDirection: "row", alignItems: "flex-end" },
  cloudBubbleBig: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  cloudBubbleMid: { width: 85, height: 85, borderRadius: 42, backgroundColor: "#FFFFFF", marginLeft: -30, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  cloudBubbleSmall: { width: 65, height: 65, borderRadius: 32, backgroundColor: "#FFFFFF", marginLeft: -25, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  overlay: { position: "absolute", width, height, backgroundColor: "rgba(84,177,255,0.18)" },
  bookContainer: { width: 170, height: 235, marginHorizontal: 10, alignItems: "center", backgroundColor: "rgba(15,23,42,0.45)", borderRadius: 12, paddingTop: 8 },
  book: { width: 145, height: 205, borderRadius: 12 },
  bookText: { color: "#F8FAFC", fontSize: 13, fontWeight: "700", textAlign: "center" },
  bookDetail: { width: width * 0.88, height: height * 0.65, backgroundColor: "rgba(15,23,42,0.95)", borderRadius: 18, position: "absolute", top: height * 0.175, alignSelf: "center", paddingTop: 48, },
  detailTitle: { fontSize: 27, color: "#93C5FD", marginBottom: 8, fontWeight: "800", alignSelf: "center" },
  chapterContainer: { alignItems: "center", justifyContent: "center", width: ITEM_WIDTH },
  chapterImageWrapper: { width: width * 0.66, height: height * 0.52 },
  chapterImage: { width: ITEM_WIDTH, height: width * 0.65, borderRadius: 16, marginTop: 60, },
  chapterOverlayTitle: { position: "absolute", top: 14, left: 10, right: 10, color: "#FFF", textAlign: "center", fontSize: 15, fontWeight: "800" },
  chapterText: { color: "#F8FAFC", fontSize: 16, fontWeight: "700", textAlign: "center", marginTop: 6 },
  chapterSubText: { color: "#CBD5E1", fontSize: 14, textAlign: "center", marginTop: 2 },
  synopsisText: { color: "#E2E8F0", fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 18 },
  closeButton: { position: "absolute", top: 15, left: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(2,6,23,0.82)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalCard: { width: "100%", backgroundColor: "#0F172A", borderRadius: 18, padding: 16, alignItems: "center" },
  modalImage: { width: width * 0.78, height: height * 0.28, borderRadius: 12, marginBottom: 10 },
  playButton: { marginTop: 12, flexDirection: "row", alignItems: "center", backgroundColor: "#22D3EE", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  playIcon: { marginRight: 6 },
  playButtonText: { color: "#0F172A", fontWeight: "800", fontSize: 14 },
  modalCloseButton: { marginTop: 10 },
  stackCard: { height: 250, width: width * 0.55, alignSelf: "center", marginVertical: 10, borderRadius: 20, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "top", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 },
  stackImage: { width: "85%", height: "75%", borderRadius: 20, marginTop: 20 },
  stackTitle: { position: "absolute", bottom: 10, color: "#FFF", fontWeight: "800", fontSize: 16 },
  watchedIcon: { position: "absolute", bottom: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 20, padding: 4, },
});