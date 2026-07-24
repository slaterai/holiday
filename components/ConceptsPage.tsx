"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

interface Concept {
  id: string;
  title: string;
  description: string;
  classification: string;
  tags: string[];
  createdAt: string;
}

export default function ConceptsPage() {
  const { user } = useUser();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadConcepts();
  }, [user]);

  async function loadConcepts() {
    if (!user) return;
    setLoading(true);
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("concepts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const concepts = (data as any[])?.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        classification: c.classification,
        tags: c.tags || [],
        createdAt: c.created_at,
      })) || [];

      setConcepts(concepts);
    } catch (err) {
      console.error("Failed to load concepts:", err);
    } finally {
      setLoading(false);
    }
  }

  const classificationColors: Record<string, string> = {
    content_concept: "#22c55e",
    email_draft: "#ef4444",
    brand_inquiry: "#22d3ee",
    idea: "#a78bfa",
    note: "#6b6b6b",
  };

  const filtered = selectedTag
    ? concepts.filter((c) => c.tags.includes(selectedTag))
    : concepts;

  const allTags = Array.from(new Set(concepts.flatMap((c) => c.tags)));

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Loading concepts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-medium">Concepts</h1>
          <p className="text-white/40 text-xs">
            {concepts.length}
          </p>
        </div>

        {/* Compact tag filter */}
        {allTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-[11px] px-2 py-1 rounded transition-colors ${
                selectedTag === null
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/50 hover:text-white/70"
              }`}
            >
              All
            </button>
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] px-2 py-1 rounded transition-colors ${
                  selectedTag === tag
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/50 hover:text-white/70"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Concepts list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {filtered.length === 0 ? (
            <p className="text-white/20 text-sm">No concepts yet</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((concept) => (
                <div
                  key={concept.id}
                  className="bg-white/[0.02] border border-white/[0.06] rounded p-4"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                      style={{
                        color: classificationColors[concept.classification],
                        background: `${classificationColors[concept.classification]}18`,
                      }}
                    >
                      {concept.classification.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-white font-medium text-sm leading-snug flex-1">
                      {concept.title}
                    </h3>
                  </div>

                  <div className="text-white/60 text-xs leading-relaxed whitespace-pre-line mb-2">
                    {concept.description}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-white/25">
                      {new Date(concept.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(concept.description)}
                      className="text-[11px] text-white/40 hover:text-white/60 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
