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
      <div className="border-b border-white/[0.06] p-6">
        <h1 className="text-white font-medium mb-4">Concepts</h1>
        <p className="text-white/40 text-sm mb-4">
          {concepts.length} concept{concepts.length !== 1 ? "s" : ""}
        </p>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                selectedTag === null
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white/60 hover:text-white/80"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  selectedTag === tag
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/60 hover:text-white/80"
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
        <div className="p-6">
          {filtered.length === 0 ? (
            <p className="text-white/20 text-sm">No concepts yet</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((concept) => (
                <div
                  key={concept.id}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-white font-medium text-sm flex-1 leading-snug">
                      {concept.title}
                    </h3>
                    <span
                      className="text-[9px] font-semibold tracking-wider uppercase px-2 py-1 rounded shrink-0"
                      style={{
                        color: classificationColors[concept.classification],
                        background: `${classificationColors[concept.classification]}18`,
                      }}
                    >
                      {concept.classification.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {concept.description}
                  </p>

                  {concept.tags.length > 0 && (
                    <div className="flex gap-1.5 mb-3">
                      {concept.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-1 bg-white/10 rounded text-white/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">
                      {new Date(concept.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(concept.description)}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors"
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
