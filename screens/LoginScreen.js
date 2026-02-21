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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Importar datos del JSON original
import simpsonsData from "../assets/SIMPSONS_TV_ART/simpsons.js";

// Importar mappings de imágenes
import { seasonImages, chapterImages } from "../assets/SIMPSONS_TV_ART/images.js";

const { width, height } = Dimensions.get("window");

export default function LibraryScreen() {
  const [selectedSeason, setSelectedSeason] = useState(null);
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

  const zoomStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -30],
        }),
      },
    ],
  };

  const renderSeason = ({ item, index }) => {
    const inputRange = [(index - 1) * 140, index * 140, (index + 1) * 140];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["20deg", "0deg", "-20deg"],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity onPress={() => openSeason(item)} activeOpacity={0.8}>
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
    <View style={styles.chapterContainer}>
      <Image source={item.imageResolved} style={styles.chapterImage} resizeMode="contain" />
      <Text style={styles.chapterText}>{item.episodeNumber}. {item.title}</Text>
      <Text style={styles.chapterSubText}>Duración: {item.duration} min</Text>
      <Text style={styles.chapterSubText}>Fecha emisión: {item.airDate || "Desconocida"}</Text>
      <ScrollView style={styles.synopsisContainer}>
        <Text style={styles.synopsisText}>{item.synopsis}</Text>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/libreria.jpg")}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      />
      <View style={styles.overlay} />

      {!selectedSeason ? (
        <Animated.FlatList
          data={seasons}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 30, alignItems: "center" }}
          keyExtractor={(item) => item.id}
          renderItem={renderSeason}
          snapToInterval={140}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
        />
      ) : (
        <Animated.View style={[styles.bookDetail, zoomStyle]}>
          <Text style={styles.detailTitle}>{selectedSeason.title}</Text>

          <FlatList
            data={selectedSeason.episodes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderEpisode}
            contentContainerStyle={{ paddingHorizontal: 10, alignItems: "center" }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={closeSeason}>
            <Ionicons name="arrow-back-circle" size={40} color="#FFD700" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
  background: { position: "absolute", width: width, height: height, top: 0, left: 0 },
  overlay: { position: "absolute", width: width, height: height, backgroundColor: "rgba(0,0,0,0.35)" },
  bookContainer: { width: 120, height: 170, marginHorizontal: 10, alignItems: "center" },
  book: { width: 100, height: 150, borderRadius: 8, borderWidth: 2, borderColor: "#FFD700" },
  bookText: { color: "#FFD700", marginTop: 5, fontSize: 14, fontWeight: "bold", textShadowColor: "#000", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: "center" },
  bookDetail: { width: width * 0.9, height: height * 0.85, backgroundColor: "#333", borderRadius: 15, justifyContent: "center", alignItems: "center", position: "absolute", zIndex: 10, paddingVertical: 10 },
  detailTitle: { fontSize: 28, color: "#FFD700", marginBottom: 15, fontWeight: "bold", textShadowColor: "#000", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  chapterContainer: { marginHorizontal: 5, alignItems: "center", width: width * 0.6 },
  chapterImage: { width: width * 0.5, height: height * 0.4, borderRadius: 10, borderWidth: 2, borderColor: "#FFD700" },
  chapterText: { color: "#FFD700", marginTop: 5, fontSize: 16, fontWeight: "bold", textShadowColor: "#000", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, textAlign: "center" },
  chapterSubText: { color: "#FFD700", fontSize: 14, textAlign: "center", marginTop: 2 },
  synopsisContainer: { maxHeight: 100, marginTop: 5 },
  synopsisText: { color: "#FFD700", fontSize: 12, textAlign: "center" },
  closeButton: { position: "absolute", top: 15, left: 15 },
});