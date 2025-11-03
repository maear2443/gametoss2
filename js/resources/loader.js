/**
 * 📦 리소스 로더
 *
 * 이미지, 음악, 효과음 등 모든 리소스를 로딩하고 관리합니다.
 */

import { CHARACTER_TYPES, COLOR_TYPES } from '../config/settings.js';

// ==============================================
// 리소스 저장소
// ==============================================

export const resources = {
    charactersData: null,
    playlistData: null,
    soundsData: null,
    characterImages: {
        red: {},
        blue: {}
    },
    soundEffects: {},
    currentAudio: null,
    currentSong: null,
    beatmaps: {} // 비트맵 데이터 저장
};

// ==============================================
// 메인 로딩 함수
// ==============================================

/**
 * 모든 리소스를 비동기로 로딩합니다.
 *
 * @returns {Promise<void>}
 */
export async function loadAllResources() {
    console.log('🔄 리소스 로딩 시작...');

    try {
        // JSON 메타데이터 로드
        await loadMetadata();

        // 이미지 로드
        await loadCharacterImages();

        // 효과음 로드
        await loadSoundEffects();

        console.log('✅ 모든 리소스 로딩 완료!');
    } catch (error) {
        console.error('❌ 리소스 로딩 실패:', error);
        throw error;
    }
}

// ==============================================
// JSON 메타데이터 로딩
// ==============================================

/**
 * JSON 메타데이터 파일들을 로드합니다.
 */
async function loadMetadata() {
    try {
        // characters.json 로드 (선택적)
        try {
            const charsResponse = await fetch('assets/images/characters.json');
            if (charsResponse.ok) {
                resources.charactersData = await charsResponse.json();
                console.log('✅ characters.json 로드 완료');
            }
        } catch (e) {
            console.warn('⚠️ characters.json 없음 (선택적 파일)');
        }

        // playlist.json 로드 (선택적)
        try {
            const playlistResponse = await fetch('assets/music/playlist.json');
            if (playlistResponse.ok) {
                resources.playlistData = await playlistResponse.json();
                console.log('✅ playlist.json 로드 완료');
            }
        } catch (e) {
            console.warn('⚠️ playlist.json 없음 (선택적 파일)');
        }

        // sounds.json 로드 (선택적)
        try {
            const soundsResponse = await fetch('assets/sounds/sounds.json');
            if (soundsResponse.ok) {
                resources.soundsData = await soundsResponse.json();
                console.log('✅ sounds.json 로드 완료');
            }
        } catch (e) {
            console.warn('⚠️ sounds.json 없음 (선택적 파일)');
        }
    } catch (error) {
        console.warn('⚠️ 메타데이터 로딩 중 오류:', error);
    }
}

// ==============================================
// 이미지 로딩
// ==============================================

/**
 * 모든 캐릭터 이미지를 로드합니다.
 */
async function loadCharacterImages() {
    const promises = [];

    COLOR_TYPES.forEach(color => {
        CHARACTER_TYPES.forEach(characterType => {
            resources.characterImages[color][characterType] = {
                stage1: null,
                stage2: null,
                stage3: null
            };

            // 3단계 이미지 로드
            for (let stage = 1; stage <= 3; stage++) {
                const imagePath = `assets/images/${color}/${characterType}_stage${stage}.png`;
                const promise = loadImage(imagePath)
                    .then(img => {
                        resources.characterImages[color][characterType][`stage${stage}`] = img;
                        console.log(`✅ 이미지 로드 성공: ${imagePath} (${img.width}x${img.height})`);
                    })
                    .catch(err => {
                        console.error(`❌ 이미지 로드 실패: ${imagePath}`, err);
                        // 실패해도 계속 진행 (fallback으로 색상 박스 사용)
                    });

                promises.push(promise);
            }
        });
    });

    await Promise.allSettled(promises);

    // 로딩 결과 요약
    console.log('📊 캐릭터 이미지 로딩 요약:');
    COLOR_TYPES.forEach(color => {
        CHARACTER_TYPES.forEach(characterType => {
            const images = resources.characterImages[color][characterType];
            const loaded = [images.stage1, images.stage2, images.stage3].filter(img => img !== null).length;
            console.log(`  ${color}/${characterType}: ${loaded}/3 로드됨`);
        });
    });
    console.log('✅ 캐릭터 이미지 로딩 완료');
}

/**
 * 단일 이미지를 로드합니다.
 *
 * @param {string} src - 이미지 경로
 * @returns {Promise<Image>}
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
        img.src = src;
    });
}

// ==============================================
// 효과음 로딩
// ==============================================

/**
 * 효과음을 로드합니다.
 */
async function loadSoundEffects() {
    const soundFiles = [
        'approve_success',
        'reject_success',
        'approve_fail',
        'reject_fail'
    ];

    soundFiles.forEach(soundName => {
        try {
            const audio = new Audio(`assets/sounds/${soundName}.wav`);
            audio.preload = 'auto';
            resources.soundEffects[soundName] = audio;
            console.log(`✅ 효과음 로드: ${soundName}`);
        } catch (error) {
            console.warn(`⚠️ 효과음 로드 실패: ${soundName}`);
        }
    });

    console.log('✅ 효과음 로딩 완료');
}

// ==============================================
// 캐릭터 이미지 가져오기
// ==============================================

/**
 * 랜덤 캐릭터의 이미지를 반환합니다.
 *
 * @param {string} color - 캐릭터 색상 ('red' 또는 'blue')
 * @returns {{characterType: string, images: {stage1: Image, stage2: Image, stage3: Image}}}
 */
export function getRandomCharacter(color) {
    // 랜덤 캐릭터 타입 선택
    const characterType = CHARACTER_TYPES[Math.floor(Math.random() * CHARACTER_TYPES.length)];

    // 이미지 가져오기
    const images = resources.characterImages[color][characterType];

    return {
        characterType,
        images: {
            stage1: images.stage1,
            stage2: images.stage2,
            stage3: images.stage3
        }
    };
}

// ==============================================
// 음악 관리
// ==============================================

/**
 * 플레이리스트에서 랜덤 곡을 선택합니다.
 *
 * @returns {{bpm: number, name: string, audio: Audio, duration: number}}
 */
export function selectRandomSong() {
    // playlist.json이 있으면 사용
    if (resources.playlistData && resources.playlistData.songs) {
        const songs = resources.playlistData.songs;
        const song = songs[Math.floor(Math.random() * songs.length)];

        const audio = new Audio(`assets/music/${song.file}`);
        audio.loop = false; // 노래 길이만큼만 재생

        resources.currentAudio = audio;
        resources.currentSong = song;

        console.log(`🎵 선택된 곡: ${song.name} (${song.bpm} BPM, ${song.duration}초)`);

        return {
            bpm: song.bpm,
            name: song.name,
            audio: audio,
            duration: song.duration
        };
    }

    // 기본값 반환 (음악 없음)
    console.warn('⚠️ 플레이리스트가 없습니다. 기본 BPM 사용');
    return {
        bpm: 120,
        name: 'No Music',
        audio: null,
        duration: 60
    };
}

/**
 * 플레이리스트에서 특정 인덱스의 곡을 선택합니다.
 *
 * @param {number} index - 곡 인덱스
 * @returns {{bpm: number, name: string, audio: Audio, duration: number}}
 */
export function selectSongByIndex(index) {
    // playlist.json이 있으면 사용
    if (resources.playlistData && resources.playlistData.songs) {
        const songs = resources.playlistData.songs;

        // 유효한 인덱스 확인
        if (index < 0 || index >= songs.length) {
            console.warn(`⚠️ 잘못된 곡 인덱스: ${index}, 첫 번째 곡 사용`);
            index = 0;
        }

        const song = songs[index];

        const audio = new Audio(`assets/music/${song.file}`);
        audio.loop = false; // 노래 길이만큼만 재생

        resources.currentAudio = audio;
        resources.currentSong = song;

        console.log(`🎵 선택된 곡: ${song.name} (${song.bpm} BPM, ${song.duration}초)`);

        return {
            bpm: song.bpm,
            name: song.name,
            audio: audio,
            duration: song.duration
        };
    }

    // 기본값 반환 (음악 없음)
    console.warn('⚠️ 플레이리스트가 없습니다. 기본 BPM 사용');
    return {
        bpm: 120,
        name: 'No Music',
        audio: null,
        duration: 60
    };
}

/**
 * 플레이리스트의 모든 곡 정보를 반환합니다.
 *
 * @returns {Array} 곡 목록
 */
export function getAllSongs() {
    if (resources.playlistData && resources.playlistData.songs) {
        return resources.playlistData.songs;
    }
    return [];
}

/**
 * 비트맵 파일을 로드합니다.
 *
 * @param {string} songFile - 음악 파일명 (예: "DREAM RACE (Remix).mp3")
 * @returns {Promise<Object|null>} 비트맵 데이터 또는 null
 */
export async function loadBeatmap(songFile) {
    // 파일명에서 확장자 제거
    const songName = songFile.replace('.mp3', '').replace('.MP3', '');
    const beatmapPath = `assets/music/beatmaps/${songName}.json`;

    // 이미 로드된 비트맵이 있으면 반환
    if (resources.beatmaps[songName]) {
        console.log(`✅ 캐시된 비트맵 사용: ${songName}`);
        return resources.beatmaps[songName];
    }

    try {
        console.log(`🎼 비트맵 로딩 시도: ${beatmapPath}`);
        const response = await fetch(beatmapPath);

        if (!response.ok) {
            console.warn(`⚠️ 비트맵 없음: ${beatmapPath} (${response.status})`);
            return null;
        }

        const beatmap = await response.json();
        resources.beatmaps[songName] = beatmap;

        console.log(`✅ 비트맵 로드 완료: ${songName}`);
        console.log(`   - 비트 수: ${beatmap.beats?.all_beats?.length || 0}개`);
        console.log(`   - 게임 이벤트: ${beatmap.game_events?.length || 0}개`);

        return beatmap;
    } catch (error) {
        console.warn(`⚠️ 비트맵 로드 실패: ${beatmapPath}`, error);
        return null;
    }
}

/**
 * 현재 선택된 곡의 비트맵을 반환합니다.
 *
 * @returns {Object|null} 비트맵 데이터 또는 null
 */
export function getCurrentBeatmap() {
    if (!resources.currentSong) {
        return null;
    }

    const songName = resources.currentSong.file.replace('.mp3', '').replace('.MP3', '');
    return resources.beatmaps[songName] || null;
}

/**
 * 현재 음악을 재생합니다.
 */
export function playMusic() {
    if (resources.currentAudio) {
        resources.currentAudio.play().catch(err => {
            console.warn('⚠️ 음악 재생 실패:', err);
        });
    }
}

/**
 * 현재 음악을 정지합니다.
 */
export function stopMusic() {
    if (resources.currentAudio) {
        resources.currentAudio.pause();
    }
}

/**
 * 현재 음악을 처음부터 다시 재생합니다.
 */
export function resetMusic() {
    if (resources.currentAudio) {
        resources.currentAudio.currentTime = 0;
    }
}

// ==============================================
// 효과음 재생
// ==============================================

/**
 * 효과음을 재생합니다.
 *
 * @param {string} soundName - 효과음 이름
 */
export function playSound(soundName) {
    const sound = resources.soundEffects[soundName];
    if (sound) {
        // 처음부터 재생
        sound.currentTime = 0;
        sound.play().catch(err => {
            console.warn(`⚠️ 효과음 재생 실패: ${soundName}`, err);
        });
    }
}

// ==============================================
// 리소스 정리
// ==============================================

/**
 * 모든 리소스를 정리합니다.
 */
export function clearResources() {
    // 음악 정지
    stopMusic();

    // 리소스 초기화
    resources.currentAudio = null;
    resources.currentSong = null;
}
