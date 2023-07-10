export interface IOpenAiStoryData {
  title: string;
  chapters: string[];
  characters: ICharacterList[]
}

export interface ICharacterPromptReturn {
  charPrompts: ICharacterList[]
}

export interface ICharacterList {
  name: string;
  info: string;
  prompt?: string;
}


export interface IStoryPrompts {
  chapterPrompts: string[];
}

export interface INewChapter {
  new_chapter: string;
}