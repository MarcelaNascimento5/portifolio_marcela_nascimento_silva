/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FolderOpen, 
  ChevronLeft, 
  ChevronRight, 
  Bold, 
  Italic, 
  Heading, 
  Strikethrough, 
  List, 
  Quote, 
  Code, 
  Table, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Cloud,
  Share2,
  Menu,
  Eye,
  EyeOff,
  Layout,
  Maximize2,
  Minimize2,
  Settings,
  HelpCircle,
  FileText,
  Download,
  Printer,
  FileCode,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronDown,
  File,
  Folder,
  LogIn,
  LogOut,
  User as UserIcon,
  History,
  Upload,
  HardDrive,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import ReactMarkdown from "react-markdown";

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  auth, 
  db, 
  storage,
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from "./firebase";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  ownerId?: string;
}

interface StorageFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  ownerId: string;
  createdAt: any;
}

export default function App() {
  const [markdown, setMarkdown] = useState("# Bem-vindo ao PRISMA\n\nComece a escrever seu Markdown aqui...");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // History management
  const [history, setHistory] = useState<string[]>(["# Bem-vindo ao PRISMA\n\nComece a escrever seu Markdown aqui..."]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isInternalChange = useRef(false);

  const addToHistory = (newText: string) => {
    if (newText === history[historyIndex]) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    if (newHistory.length > 100) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isInternalChange.current = true;
      const prev = history[historyIndex - 1];
      setMarkdown(prev);
      setHistoryIndex(historyIndex - 1);
      logAction("Undo", "User performed undo action");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isInternalChange.current = true;
      const next = history[historyIndex + 1];
      setMarkdown(next);
      setHistoryIndex(historyIndex + 1);
      logAction("Redo", "User performed redo action");
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = "", isBlock: boolean = false, toolName: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    
    let replacement = "";
    let needsNewline = false;

    if (isBlock) {
      const before = markdown.substring(0, start);
      needsNewline = before.length > 0 && !before.endsWith("\n");
      replacement = `${needsNewline ? "\n" : ""}${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}${selectedText}${suffix}`;
    }

    const newMarkdown = 
      markdown.substring(0, start) + 
      replacement + 
      markdown.substring(end);

    setMarkdown(newMarkdown);
    addToHistory(newMarkdown);
    if (toolName) logAction("Markdown Tool", `Used tool: ${toolName}`);

    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      const offset = needsNewline ? 1 : 0;
      if (selectedText) {
        textarea.setSelectionRange(start + offset, start + offset + replacement.length - (needsNewline ? 1 : 0));
      } else {
        const newCursorPos = start + offset + prefix.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const [showNavbar, setShowNavbar] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [fileName, setFileName] = useState("Untitled.md");
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [actionLogs, setActionLogs] = useState<{id: string, action: string, details: string, timestamp: any}[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // File System State
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'Untitled.md', type: 'file', parentId: null, content: "# Bem-vindo ao PRISMA\n\nComece a escrever seu Markdown aqui..." },
    { id: '2', name: 'Drafts', type: 'folder', parentId: null },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>('1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['2']));

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFolders(newExpanded);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const fileId = Math.random().toString(36).substr(2, 9);
    const storageRef = ref(storage, `users/${user.uid}/assets/${fileId}_${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      const storageFileData: StorageFile = {
        id: fileId,
        name: file.name,
        url,
        size: file.size,
        type: file.type,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'storageFiles', fileId), storageFileData);
      logAction("Upload File", `Uploaded asset: ${file.name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'storageFiles');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (file: StorageFile) => {
    if (!user || !confirm(`Delete ${file.name}?`)) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, `users/${user.uid}/assets/${file.id}_${file.name}`);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'storageFiles', file.id));
      logAction("Delete Asset", `Deleted asset: ${file.name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `storageFiles/${file.id}`);
    }
  };

  const logAction = async (action: string, details: string = "") => {
    if (user) {
      const logId = Math.random().toString(36).substr(2, 9);
      const path = `actionLogs/${logId}`;
      await setDoc(doc(db, 'actionLogs', logId), {
        userId: user.uid,
        action,
        details,
        timestamp: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, path));
    }
  };

  const createFile = (parentId: string | null = null) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newFile: FileItem = { id: newId, name: 'New File.md', type: 'file', parentId, content: '', ownerId: user?.uid };
    setFiles([...files, newFile]);
    setSelectedId(newId);
    setEditingId(newId);
    if (parentId) {
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(parentId);
      setExpandedFolders(newExpanded);
    }

    if (user) {
      const path = `files/${newId}`;
      setDoc(doc(db, 'files', newId), {
        ...newFile,
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, path));
      logAction("Create File", `Created file: ${newFile.name}`);
    }
  };

  const createFolder = (parentId: string | null = null) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newFolder: FileItem = { id: newId, name: 'New Folder', type: 'folder', parentId, ownerId: user?.uid };
    setFiles([...files, newFolder]);
    setSelectedId(newId);
    setEditingId(newId);
    if (parentId) {
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(parentId);
      setExpandedFolders(newExpanded);
    }

    if (user) {
      const path = `files/${newId}`;
      setDoc(doc(db, 'files', newId), {
        ...newFolder,
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, path));
      logAction("Create Folder", `Created folder: ${newFolder.name}`);
    }
  };

  const deleteItem = (id: string) => {
    const item = files.find(f => f.id === id);
    const toDelete = new Set([id]);
    const findChildren = (parentId: string) => {
      files.forEach(f => {
        if (f.parentId === parentId) {
          toDelete.add(f.id);
          if (f.type === 'folder') findChildren(f.id);
        }
      });
    };
    findChildren(id);
    
    setFiles(files.filter(f => !toDelete.has(f.id)));
    if (toDelete.has(selectedId!)) setSelectedId(null);

    if (user) {
      toDelete.forEach(itemId => {
        const path = `files/${itemId}`;
        deleteDoc(doc(db, 'files', itemId))
          .catch(e => handleFirestoreError(e, OperationType.DELETE, path));
      });
      logAction("Delete Item", `Deleted ${item?.type}: ${item?.name}`);
    }
  };

  const renameItem = (id: string, newName: string) => {
    const item = files.find(f => f.id === id);
    const oldName = item?.name;
    setFiles(files.map(f => f.id === id ? { ...f, name: newName } : f));
    if (id === selectedId) setFileName(newName);
    setEditingId(null);

    if (user) {
      const path = `files/${id}`;
      updateDoc(doc(db, 'files', id), {
        name: newName,
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
      logAction("Rename Item", `Renamed ${item?.type} from ${oldName} to ${newName}`);
    }
  };

  const selectFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file && file.type === 'file') {
      setSelectedId(id);
      setFileName(file.name);
      setMarkdown(file.content || "");
      // Reset history for new file
      setHistory([file.content || ""]);
      setHistoryIndex(0);
    }
  };

  const exportMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    logAction("Export", `Exported file: ${fileName}`);
  };

  const importMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdown(content);
      addToHistory(content);
      setFileName(file.name);
      logAction("Import", `Imported file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const generateTOC = () => {
    const lines = markdown.split('\n');
    const headings = lines
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s*/, '');
        return { level, text };
      });
    return headings;
  };

  const renderTree = (parentId: string | null, depth: number) => {
    return files
      .filter(f => f.parentId === parentId)
      .map(file => (
        <div key={file.id}>
          <div 
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-gray-100 group transition-colors",
              selectedId === file.id && "bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
            style={{ paddingLeft: `${depth * 16 + 16}px` }}
            onClick={() => {
              if (file.type === 'folder') toggleFolder(file.id);
              selectFile(file.id);
            }}
          >
            {file.type === 'folder' ? (
              expandedFolders.has(file.id) ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />
            ) : (
              <File className="h-4 w-4 text-gray-400" />
            )}
            
            {editingId === file.id ? (
              <input
                autoFocus
                className="text-sm bg-white border border-blue-400 px-1 outline-none w-full"
                defaultValue={file.name}
                onBlur={(e) => renameItem(file.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') renameItem(file.id, (e.target as HTMLInputElement).value);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm truncate flex-1">{file.name}</span>
            )}

            <div className="hidden group-hover:flex items-center gap-0.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); setEditingId(file.id); }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0 text-gray-400 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); deleteItem(file.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              {file.type === 'folder' && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                    onClick={(e) => { e.stopPropagation(); createFile(file.id); }}
                  >
                    <FilePlus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                    onClick={(e) => { e.stopPropagation(); createFolder(file.id); }}
                  >
                    <FolderPlus className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {file.type === 'folder' && expandedFolders.has(file.id) && (
            <div>{renderTree(file.id, depth + 1)}</div>
          )}
        </div>
      ));
  };

  // Sync markdown content with files state
  useEffect(() => {
    if (selectedId) {
      setFiles(prev => prev.map(f => f.id === selectedId ? { ...f, content: markdown } : f));
    }
  }, [markdown, selectedId]);

  // History tracking for typing
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const timer = setTimeout(() => {
      addToHistory(markdown);
    }, 800);
    return () => clearTimeout(timer);
  }, [markdown]);

  // Stats calculation
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;
  const lineCount = markdown.split('\n').length;
  const byteCount = new Blob([markdown]).size;

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Load Preferences
        const prefDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (prefDoc.exists()) {
          const data = prefDoc.data();
          setFocusMode(data.focusMode ?? false);
          setSyncScroll(data.syncScroll ?? true);
          setShowStatusBar(data.showStatusBar ?? true);
          setShowNavbar(data.showNavbar ?? true);
        } else {
          // Initialize preferences in Firestore
          await setDoc(doc(db, 'users', currentUser.uid), {
            focusMode,
            syncScroll,
            showStatusBar,
            showNavbar,
            updatedAt: serverTimestamp()
          });
        }

        // Load Files
        const q = query(collection(db, 'files'), where('ownerId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const loadedFiles: FileItem[] = [];
        querySnapshot.forEach((doc) => {
          loadedFiles.push(doc.data() as FileItem);
        });
        
        if (loadedFiles.length > 0) {
          setFiles(loadedFiles);
          // Select first file if available
          const firstFile = loadedFiles.find(f => f.type === 'file');
          if (firstFile) {
            selectFile(firstFile.id);
          }
        }

        // Load History
        const historyQ = query(
          collection(db, 'actionLogs'), 
          where('userId', '==', currentUser.uid)
        );
        onSnapshot(historyQ, (snapshot) => {
          const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];
          setActionLogs(logs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
        });

        // Load Storage Files
        const storageQ = query(
          collection(db, 'storageFiles'),
          where('ownerId', '==', currentUser.uid)
        );
        onSnapshot(storageQ, (snapshot) => {
          const files = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as StorageFile[];
          setStorageFiles(files.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        });

      } else {
        // Reset to defaults on logout
        setFiles([
          { id: '1', name: 'Untitled.md', type: 'file', parentId: null, content: "# Bem-vindo ao PRISMA\n\nComece a escrever seu Markdown aqui..." },
          { id: '2', name: 'Drafts', type: 'folder', parentId: null },
        ]);
        setSelectedId('1');
        setMarkdown("# Bem-vindo ao PRISMA\n\nComece a escrever seu Markdown aqui...");
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Preferences to Firestore
  useEffect(() => {
    if (user && isAuthReady) {
      const path = `users/${user.uid}`;
      setDoc(doc(db, 'users', user.uid), {
        focusMode,
        syncScroll,
        showStatusBar,
        showNavbar,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
      
      // Log setting changes (only if it's not the initial load)
      const timer = setTimeout(() => {
        logAction("Update Settings", "User updated application preferences");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [focusMode, syncScroll, showStatusBar, showNavbar, user, isAuthReady]);

  // Sync Markdown Content to Firestore
  useEffect(() => {
    if (user && selectedId && isAuthReady) {
      const timer = setTimeout(() => {
        const path = `files/${selectedId}`;
        updateDoc(doc(db, 'files', selectedId), {
          content: markdown,
          updatedAt: serverTimestamp()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, path));
      }, 2000); // Debounce sync
      return () => clearTimeout(timer);
    }
  }, [markdown, selectedId, user, isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      logAction("Login", "User logged in");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      logAction("Logout", "User logged out");
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans selection:bg-secondary/30">
      {/* Top Navigation Bar */}
      <AnimatePresence>
        {showNavbar && (
          <motion.header 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card border-b border-border z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-1.5 h-12 max-w-7xl mx-auto w-full gap-4">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 mr-4">
                  <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Layout className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-black tracking-tighter text-primary">PRISMA</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300", showExplorer && "bg-primary/20 text-primary shadow-sm")}
                  onClick={() => setShowExplorer(!showExplorer)}
                  title="Toggle Explorer"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-xl transition-all duration-300", historyIndex === 0 && "opacity-30 cursor-not-allowed")}
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  title="Undo"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-xl transition-all duration-300", historyIndex === history.length - 1 && "opacity-30 cursor-not-allowed")}
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  title="Redo"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden md:block" />

              {/* Markdown Tools */}
              <div className="hidden md:flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" onClick={() => insertMarkdown("**", "**", false, "Bold")} title="Bold"><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" onClick={() => insertMarkdown("*", "*", false, "Italic")} title="Italic"><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" onClick={() => insertMarkdown("# ", "", true, "Heading")} title="Heading"><Heading className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" onClick={() => insertMarkdown("~~", "~~", false, "Strikethrough")} title="Strikethrough"><Strikethrough className="h-4 w-4" /></Button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all" onClick={() => insertMarkdown("- ", "", true, "List")} title="List"><List className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all" onClick={() => insertMarkdown("> ", "", true, "Quote")} title="Quote"><Quote className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all" onClick={() => insertMarkdown("`", "`", false, "Code")} title="Code"><Code className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all" onClick={() => insertMarkdown("\n| Col 1 | Col 2 |\n|-------|-------|\n| Val 1 | Val 2 |", "", true, "Table")} title="Table"><Table className="h-4 w-4" /></Button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-xl transition-all" onClick={() => insertMarkdown("[", "](url)", false, "Link")} title="Link"><LinkIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-xl transition-all" onClick={() => insertMarkdown("![alt](", ")", false, "Image")} title="Image"><ImageIcon className="h-4 w-4" /></Button>
              </div>

              <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
                {isEditingFileName ? (
                  <input
                    autoFocus
                    className="text-sm font-medium text-black bg-gray-100 px-2 py-0.5 rounded-md outline-none border border-blue-400 text-center w-full max-w-[200px]"
                    value={fileName}
                    onChange={(e) => {
                      setFileName(e.target.value);
                      if (selectedId) {
                        setFiles(prev => prev.map(f => f.id === selectedId ? { ...f, name: e.target.value } : f));
                      }
                    }}
                    onBlur={() => setIsEditingFileName(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditingFileName(false);
                    }}
                  />
                ) : (
                  <span 
                    className="text-sm font-bold text-foreground/80 cursor-pointer hover:text-primary hover:bg-primary/10 px-4 py-1.5 rounded-full transition-all text-center truncate shadow-sm border border-primary/10"
                    onClick={() => setIsEditingFileName(true)}
                  >
                    {fileName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-foreground/40 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all"
                  onClick={() => alert("Sincronizando com a nuvem...")}
                  title="Sync"
                >
                  <Cloud className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link de compartilhamento copiado!");
                  }}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Menu">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setShowTOC(true)}>
                      <FileText className="h-4 w-4" />
                      <span>TOC</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setShowHistory(true)}>
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setShowAssets(true)}>
                      <HardDrive className="h-4 w-4" />
                      <span>Assets</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setShowCheatSheet(true)}>
                      <HelpCircle className="h-4 w-4" />
                      <span>Cheat Sheet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.md';
                      input.onchange = (e) => importMarkdown(e as any);
                      input.click();
                    }}>
                      <Download className="h-4 w-4" />
                      <span>Import</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={exportMarkdown}>
                      <Download className="h-4 w-4 rotate-180" />
                      <span>Export</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => {
                      window.print();
                      logAction("Print", "User triggered print dialog");
                    }}>
                      <Printer className="h-4 w-4" />
                      <span>Print</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => {
                      setMarkdown("# Novo Template\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hello');\n```");
                      addToHistory("# Novo Template\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hello');\n```");
                      logAction("Template", "User applied a new template");
                    }}>
                      <FileCode className="h-4 w-4" />
                      <span>Templates</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setShowSettings(true)}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user ? (
                      <>
                        <div className="px-2 py-1.5 flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <UserIcon className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer text-primary focus:text-primary focus:bg-primary/10" onClick={handleLogin}>
                        <LogIn className="h-4 w-4" />
                        <span>Login with Google</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      {/* Modals and Overlays */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCheatSheet(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Markdown Cheat Sheet</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCheatSheet(false)}><ChevronRight className="rotate-90" /></Button>
              </div>
              <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold mb-2 text-blue-600">Headings</h3>
                  <pre className="bg-gray-50 p-2 rounded text-sm"># Heading 1{"\n"}## Heading 2{"\n"}### Heading 3</pre>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-blue-600">Emphasis</h3>
                  <pre className="bg-gray-50 p-2 rounded text-sm">**Bold**{"\n"}*Italic*{"\n"}~~Strikethrough~~</pre>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-blue-600">Lists</h3>
                  <pre className="bg-gray-50 p-2 rounded text-sm">- Item 1{"\n"}- Item 2{"\n"}1. Ordered Item</pre>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-blue-600">Links & Images</h3>
                  <pre className="bg-gray-50 p-2 rounded text-sm">[Link](url){"\n"}![Alt](url)</pre>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-blue-600">Code</h3>
                  <pre className="bg-gray-50 p-2 rounded text-sm">`Inline Code`{"\n"}```{"\n"}Code Block{"\n"}```</pre>
                </div>
                <div>
                  <h3 className="font-bold mb-2 text-blue-600">Quotes</h3>
                  <pre className="bg-gray-50 p-2 rounded text-sm">{">"} This is a quote</pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}><ChevronRight className="rotate-90" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span>Focus Mode</span>
                  <Button 
                    variant={focusMode ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setFocusMode(!focusMode)}
                  >
                    {focusMode ? "On" : "Off"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sync Scroll</span>
                  <Button 
                    variant={syncScroll ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSyncScroll(!syncScroll)}
                  >
                    {syncScroll ? "On" : "Off"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Status Bar</span>
                  <Button 
                    variant={showStatusBar ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowStatusBar(!showStatusBar)}
                  >
                    {showStatusBar ? "On" : "Off"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Navbar</span>
                  <Button 
                    variant={showNavbar ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setShowNavbar(!showNavbar)}
                  >
                    {showNavbar ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showTOC && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-[100] border-l border-gray-200 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Table of Contents</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTOC(false)}><ChevronRight /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {generateTOC().length === 0 ? (
                <p className="text-gray-400 text-center mt-10">Nenhum cabeçalho encontrado.</p>
              ) : (
                <div className="space-y-2">
                  {generateTOC().map((h, i) => (
                    <div 
                      key={i} 
                      className="hover:text-blue-600 cursor-pointer truncate"
                      style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                      onClick={() => {
                        const textarea = textareaRef.current;
                        if (textarea) {
                          const index = markdown.indexOf(h.text);
                          if (index !== -1) {
                            textarea.focus();
                            textarea.setSelectionRange(index, index + h.text.length);
                            textarea.scrollTo({ top: textarea.scrollHeight * (index / markdown.length) });
                          }
                        }
                        setShowTOC(false);
                      }}
                    >
                      <span className="text-gray-400 mr-2">{"#".repeat(h.level)}</span>
                      {h.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {showHistory && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-[100] border-l border-gray-200 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Action History</h2>
              <div className="flex items-center gap-1">
                {user && actionLogs.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                    onClick={async () => {
                      if (confirm("Clear all history?")) {
                        const q = query(collection(db, 'actionLogs'), where('userId', '==', user.uid));
                        const snapshot = await getDocs(q);
                        snapshot.docs.forEach(doc => deleteDoc(doc.ref));
                      }
                    }}
                    title="Clear History"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}><ChevronRight /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!user ? (
                <p className="text-gray-400 text-center mt-10">Login to see your history.</p>
              ) : actionLogs.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">No actions recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {actionLogs.map((log) => (
                    <div key={log.id} className="border-b border-gray-100 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-blue-600">{log.action}</span>
                        <span className="text-[10px] text-gray-400">
                          {log.timestamp?.toDate().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {showAssets && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-[100] border-l border-gray-200 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Cloud Assets</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAssets(false)}><ChevronRight /></Button>
            </div>
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                  disabled={isUploading || !user}
                />
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isUploading || !user}
                >
                  <Upload className={cn("h-4 w-4", isUploading && "animate-bounce")} />
                  {isUploading ? "Uploading..." : "Upload Asset"}
                </Button>
              </div>
              {!user && <p className="text-[10px] text-red-500 mt-2 text-center">Login required to upload</p>}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {storageFiles.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">No assets uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {storageFiles.map((file) => (
                    <div key={file.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate flex-1 mr-2">{file.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-blue-500"
                            onClick={() => window.open(file.url, '_blank')}
                            title="Open"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500"
                            onClick={() => handleFileDelete(file)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-[10px] text-blue-500"
                          onClick={() => insertMarkdown(`![${file.name}](${file.url})`)}
                        >
                          Insert to MD
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex overflow-hidden relative">
          {/* File Explorer Sidebar */}
          <AnimatePresence>
            {showExplorer && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-card border-r border-border flex flex-col z-30 overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Explorer</span>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                      onClick={() => createFile()}
                      title="Novo Arquivo"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                      onClick={() => createFolder()}
                      title="Nova Pasta"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </Button>
                    {selectedId && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                          onClick={() => setEditingId(selectedId)}
                          title="Renomear"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all hover:scale-110 active:scale-95"
                          onClick={() => deleteItem(selectedId)}
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto py-2">
                  {files.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      Nenhum arquivo encontrado.
                    </div>
                  ) : (
                    renderTree(null, 0)
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Markdown Editor Pane */}
          {showEditor && (
            <div className={cn("flex-1 bg-card border-r border-border flex flex-col", focusMode && "max-w-3xl mx-auto border-x")}>
              <textarea 
                ref={textareaRef}
                className="flex-1 p-8 resize-none outline-none font-mono text-sm leading-relaxed text-foreground bg-transparent"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Escreva seu markdown aqui..."
              />
            </div>
          )}

          {/* HTML Preview Pane */}
          {showPreview && (
            <div className="flex-1 bg-background relative flex flex-col overflow-hidden border-l border-border">
              <div className="flex-1 overflow-y-auto py-12 pr-12 pl-24 prose prose-slate max-w-none prose-headings:font-sans prose-headings:font-bold prose-p:text-foreground">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Combined Controls - Fixed and centered on the right edge of the screen */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-2xl border-2 border-primary/20">
            {/* View Toggles */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all duration-300", !showNavbar && "text-primary bg-primary/20 shadow-inner")}
              onClick={() => setShowNavbar(!showNavbar)}
              title="Alternar Barra Superior"
            >
              {showNavbar ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-2xl transition-all duration-300", !showPreview && "text-secondary bg-secondary/20 shadow-inner")}
              onClick={() => setShowPreview(!showPreview)}
              title="Alternar Visualização"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-2xl transition-all duration-300", !showEditor && "text-accent bg-accent/20 shadow-inner")}
              onClick={() => setShowEditor(!showEditor)}
              title="Alternar Editor"
            >
              <Layout className="h-4 w-4" />
            </Button>

            <div className="h-[1px] w-full bg-gray-200/50 my-1 mx-auto max-w-[20px]" />

            {/* Mode Toggles */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all duration-300", focusMode && "text-primary bg-primary/20 shadow-inner")}
              onClick={() => setFocusMode(!focusMode)}
              title="Modo Foco"
            >
              <Maximize2 className="h-4 w-4 rotate-45" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-2xl transition-all duration-300", syncScroll && "text-secondary bg-secondary/20 shadow-inner")}
              onClick={() => setSyncScroll(!syncScroll)}
              title="Rolagem Sincronizada"
            >
              <ChevronRight className="h-4 w-4 rotate-90" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-10 w-10 text-foreground/60 hover:text-accent hover:bg-accent/10 rounded-2xl transition-all duration-300", !showStatusBar && "text-accent bg-accent/20 shadow-inner")}
              onClick={() => setShowStatusBar(!showStatusBar)}
              title="Alternar Barra de Status"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Fun Status Bar */}
      <AnimatePresence>
        {showStatusBar && (
          <motion.footer 
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest overflow-hidden shadow-inner"
          >
            <div className="flex divide-x divide-primary-foreground/10 h-6">
              <div className="flex-1 flex items-center justify-between px-4">
                <div className="flex gap-4">
                  <span>Markdown</span>
                  <span className="opacity-50">UTF-8</span>
                </div>
                <div className="flex gap-4">
                  <span>{byteCount} Bytes</span>
                  <span>{wordCount} Palavras</span>
                  <span>{lineCount} Linhas</span>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-between px-4">
                <div className="flex gap-4">
                  <span>HTML</span>
                </div>
                <div className="flex gap-4">
                  <span>{markdown.length} Caracteres</span>
                  <span>{wordCount} Palavras</span>
                  <span>{markdown.split('\n\n').length} Parágrafos</span>
                </div>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
