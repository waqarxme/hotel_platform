"use client";

import React, { useState, useEffect } from "react";
import { Review } from "@/types";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, response: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        setActiveReplyId(null);
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading guest reviews...</div>;
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Customer Reviews & Responses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Read authentic guest feedback and publish official management replies.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-cobalt-900 border border-cobalt-800">
          <div className="flex items-center gap-1 text-signal-amber">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-xl font-bold text-white font-mono">{avgRating}</span>
          </div>
          <span className="text-xs text-slate-400 border-l border-cobalt-800 pl-3">
            {reviews.length} Total Reviews
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-xs">
          No guest reviews published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{rev.guestName}</h3>
                  <p className="text-[11px] text-slate-400">
                    {rev.guestEmail} • {formatDate(rev.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-signal-amber">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-cobalt-950/40 p-3.5 rounded-xl border border-cobalt-800/60">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {rev.response ? (
                <div className="p-4 rounded-xl bg-cobalt-900/90 border border-cobalt-700/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cobalt-400 uppercase tracking-wider">
                      Official Management Reply
                    </span>
                    <span className="text-slate-400">{formatDate(rev.respondedAt || "")}</span>
                  </div>
                  <p className="text-xs text-slate-200">{rev.response}</p>
                </div>
              ) : (
                <div>
                  {activeReplyId === rev.id ? (
                    <div className="space-y-3 pt-2">
                      <TextArea
                        rows={3}
                        placeholder="Write a professional and courteous response to the guest..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveReplyId(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isSubmitting}
                          onClick={() => handleReplySubmit(rev.id)}
                          className="gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Response</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveReplyId(rev.id);
                        setReplyText("");
                      }}
                      className="gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply to Guest</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
