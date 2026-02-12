class EpisodesController < ApplicationController
  allow_unauthenticated_access

  layout "public"

  def index
    @episodes = mock_episodes
  end

  def show
    @episode = mock_episodes.find { |e| e[:id] == params[:id].to_i }
  end

  private

  def mock_episodes
    [
      {
        id: 1,
        title: "The Power of Habit",
        duration: "12:34",
        audio_url: "https://actions.google.com/sounds/v1/speech/commercial_aloud.ogg", # Placeholder
        description: "Explore the science behind habit formation and how to change them.",
        content: [
          { time: 0, text: "Welcome to the first episode of Echo.", translation: "欢迎收听 Echo 的第一期节目。" },
          { time: 3, text: "Today we are going to talk about habits.", translation: "今天我们将讨论习惯。" },
          { time: 6, text: "Habits are the invisible architecture of daily life.", translation: "习惯是日常生活中不可见的架构。" },
          { time: 10, text: "They shape our actions and our futures.", translation: "它们塑造了我们的行动和未来。" },
          { time: 15, text: "Let's dive right in.", translation: "让我们直接开始吧。" }
        ]
      },
      {
        id: 2,
        title: "Deep Work",
        duration: "08:45",
        audio_url: "https://actions.google.com/sounds/v1/speech/marine_mammals.ogg", # Placeholder
        description: "Rules for focused success in a distracted world.",
        content: [
          { time: 0, text: "In this episode, we discuss Deep Work.", translation: "在本期节目中，我们将讨论深度工作。" },
          { time: 4, text: "Deep work is the ability to focus without distraction.", translation: "深度工作是指在不受干扰的情况下专注的能力。" },
          { time: 9, text: "It requires practice and discipline.", translation: "这需要练习和自律。" },
          { time: 13, text: "But the rewards are immense.", translation: "但回报是巨大的。" }
        ]
      },
      {
        id: 3,
        title: "Atomic Habits",
        duration: "15:20",
        audio_url: "https://actions.google.com/sounds/v1/speech/wobble_1.ogg", # Placeholder
        description: "Tiny changes, remarkable results.",
        content: [
          { time: 0, text: "Atomic Habits by James Clear.", translation: "詹姆斯·克利尔的《原子习惯》。" },
          { time: 3, text: "It's about getting 1% better every day.", translation: "这是关于每天进步 1%。" },
          { time: 7, text: "Small changes compound over time.", translation: "小改变随着时间的推移而复利。" },
          { time: 11, text: "Let's learn how to build better habits.", translation: "让我们学习如何建立更好的习惯。" }
        ]
      }
    ]
  end
end
