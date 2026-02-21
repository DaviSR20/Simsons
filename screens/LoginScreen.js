import React, { useState, useRef } from "react";
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

// Importar datos del JSON original
import simpsonsData from "../assets/SIMPSONS_TV_ART/simpsons.js";

// Importar mappings de imágenes
import { seasonImages, chapterImages } from "../assets/SIMPSONS_TV_ART/images.js";

const { width, height } = Dimensions.get("window");

export default function LibraryScreen() {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const animation = useRef(new Animated.Value(0)).current;

  // Convertimos temporadas y resolvemos las imágenes
  const seasons = simpsonsData.seasons.map((s) => ({
    id: s.id.toString(),
    title: s.title,
    cover: seasonImages[s.image],
    avgColor: s.avgColor,
    episodes: s.episodes.map((e) => ({
      ...e,
      imageResolved: chapterImages[e.image],
    })),
  }));

  const openSeason = (season) => {
    setSelectedSeason(season);
    Animated.timing(animation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const closeSeason = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setSelectedSeason(null));
  };

  const openEpisode = (episode) => {
    setSelectedEpisode(episode);
  };

  const closeEpisode = () => {
    setSelectedEpisode(null);
  };

  const zoomStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -25],
        }),
      },
    ],
  };

  const renderSeason = ({ item, index }) => {
    const inputRange = [(index - 1) * 190, index * 190, (index + 1) * 190];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["18deg", "0deg", "-18deg"],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity onPress={() => openSeason(item)} activeOpacity={0.86}>
        <Animated.View
          style={[styles.bookContainer, { transform: [{ perspective: 800 }, { scale }, { rotateY }] }]}
        >
          <Image source={item.cover} style={styles.book} resizeMode="contain" />
          <Text style={styles.bookText}>{item.title}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderEpisode = ({ item }) => (
    <TouchableOpacity style={styles.chapterContainer} activeOpacity={0.85} onPress={() => openEpisode(item)}>
      <Image source={item.imageResolved} style={styles.chapterImage} resizeMode="contain" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={styles.cloudOne} />
      <View style={styles.cloudTwo} />
      <View style={styles.overlay} />

      {!selectedSeason ? (
        <Animated.FlatList
          data={seasons}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 30, alignItems: "center" }}
          keyExtractor={(item) => item.id}
          renderItem={renderSeason}
          snapToInterval={190}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
        />
      ) : (
        <Animated.View style={[styles.bookDetail, zoomStyle]}>
          <Text style={styles.detailTitle}>{selectedSeason.title}</Text>
          <Text style={styles.hintText}>Toca una imagen para ver la información del capítulo</Text>

          <FlatList
            data={selectedSeason.episodes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderEpisode}
            contentContainerStyle={{ paddingHorizontal: 10, alignItems: "center" }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={closeSeason}>
            <Ionicons name="arrow-back-circle" size={42} color="#5999ff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal visible={!!selectedEpisode} transparent animationType="fade" onRequestClose={closeEpisode}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedEpisode && (
              <>
                <Image source={selectedEpisode.imageResolved} style={styles.modalImage} resizeMode="contain" />
                <Text style={styles.chapterText}>{selectedEpisode.episodeNumber}. {selectedEpisode.title}</Text>
                <Text style={styles.chapterSubText}>Duración: {selectedEpisode.duration} min</Text>
                <Text style={styles.chapterSubText}>
                  Fecha emisión: {selectedEpisode.airDate || "Desconocida"}
                </Text>
                <Text style={styles.synopsisText}>{selectedEpisode.synopsis}</Text>

                <TouchableOpacity style={styles.playButton} activeOpacity={0.85}>
                  <Ionicons name="play" size={18} color="#1F2937" style={styles.playIcon} />
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.modalCloseButton} onPress={closeEpisode}>
              <Ionicons name="close-circle" size={40} color="#59ecff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090E1C", justifyContent: "center", alignItems: "center" },
  background: { position: "absolute", width: width, height: height, top: 0, left: 0, backgroundColor: "#0044ff" },
  cloudOne: {
    position: "absolute",
    top: height * 0.08,
    left: -30,
    width: 220,
    height: 120,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  cloudTwo: {
    position: "absolute",
    top: height * 0.18,
    right: -40,
    width: 260,
    height: 140,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  overlay: {
    position: "absolute",
    width: width,
    height: height,
    backgroundColor: "rgba(59, 130, 246, 0.18)",
  },
  bookContainer: {
    width: 170,
    height: 235,
    marginHorizontal: 10,
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    borderRadius: 12,
    paddingTop: 8,
  },
  book: { width: 145, height: 205, borderRadius: 12 },
  bookText: {
    color: "#E2E8F0",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  bookDetail: {
    width: width * 0.94,
    height: height * 0.86,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 10,
    paddingVertical: 10,
  },
  detailTitle: { fontSize: 27, color: "#93C5FD", marginBottom: 14, fontWeight: "800" },
  hintText: { color: "#CBD5E1", fontSize: 13, marginBottom: 12, opacity: 0.95 },
  chapterContainer: { marginHorizontal: 8, alignItems: "center", width: width * 0.72 },
  chapterImage: {
    width: width * 0.66,
    height: height * 0.52,
    borderRadius: 16,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
  },
  chapterText: {
    color: "#F8FAFC",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  chapterSubText: { color: "#CBD5E1", fontSize: 14, textAlign: "center", marginTop: 2 },
  synopsisText: { color: "#E2E8F0", fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 18 },
  closeButton: { position: "absolute", top: 15, left: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  modalImage: {
    width: width * 0.48,
    height: height * 0.28,
    borderRadius: 12,
    backgroundColor: "rgba(30, 41, 59, 0.65)",
  },
  playButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22D3EE",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  playIcon: {
    marginRight: 6,
  },
  playButtonText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 14,
  },
  modalCloseButton: {
    marginTop: 10,
  },
});