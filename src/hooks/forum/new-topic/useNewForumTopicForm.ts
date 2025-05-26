
import { useState } from "react";

export const useNewForumTopicForm = (initialPollOptions = ["", ""]) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Poll state
  const [enablePoll, setEnablePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(initialPollOptions);

  const isContentEffectivelyEmpty = () => {
    if (!content.trim()) return true;
    const div = document.createElement('div');
    div.innerHTML = content;
    return !div.textContent?.trim();
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 10) { // Max 10 options
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) { // Min 2 options
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  return {
    title, setTitle,
    content, setContent,
    enablePoll, setEnablePoll,
    pollQuestion, setPollQuestion,
    pollOptions, setPollOptions,
    isContentEffectivelyEmpty,
    handlePollOptionChange,
    addPollOption,
    removePollOption,
  };
};
